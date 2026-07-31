"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let InvoicesService = class InvoicesService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(dto) {
        if (!dto.lines || dto.lines.length === 0) {
            throw new common_1.BadRequestException('La factura debe tener al menos un producto');
        }
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            const [warehouses] = await conn.query('SELECT id FROM warehouses WHERE code = ?', ['BOD-01']);
            if (warehouses.length === 0)
                throw new common_1.InternalServerErrorException('Bodega Principal no encontrada.');
            const warehouseId = warehouses[0].id;
            const [emissionPoints] = await conn.query(`SELECT ep.id, ep.currentSequence 
         FROM emission_points ep 
         JOIN establishments e ON ep.establishmentId = e.id 
         WHERE ep.code = ? AND e.code = ? FOR UPDATE`, [dto.emissionPointCode, dto.establishmentCode]);
            if (emissionPoints.length === 0)
                throw new common_1.BadRequestException('Punto de emisión no encontrado');
            const emissionPoint = emissionPoints[0];
            const sequence = emissionPoint.currentSequence;
            const formattedSequence = sequence.toString().padStart(9, '0');
            const invoiceNumber = `${dto.establishmentCode}-${dto.emissionPointCode}-${formattedSequence}`;
            await conn.query('UPDATE emission_points SET currentSequence = currentSequence + 1 WHERE id = ?', [emissionPoint.id]);
            let subtotal = 0;
            let ivaAmount = 0;
            let totalCost = 0;
            const invoiceLinesData = [];
            const inventoryTransactionsData = [];
            for (const line of dto.lines) {
                const [products] = await conn.query('SELECT id, name, cost, hasIva, stock FROM products WHERE id = ? FOR UPDATE', [line.productId]);
                if (products.length === 0)
                    throw new common_1.BadRequestException(`Producto ${line.productId} no encontrado`);
                const product = products[0];
                if (product.stock < line.quantity) {
                    throw new common_1.BadRequestException(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}`);
                }
                const lineTotal = Number(line.unitPrice) * line.quantity;
                subtotal += lineTotal;
                if (product.hasIva) {
                    ivaAmount += lineTotal * 0.15;
                }
                totalCost += Number(product.cost) * line.quantity;
                await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [line.quantity, product.id]);
                invoiceLinesData.push([
                    crypto.randomUUID(),
                    null,
                    product.id,
                    line.quantity,
                    line.unitPrice,
                    lineTotal
                ]);
                inventoryTransactionsData.push([
                    crypto.randomUUID(),
                    'OUT',
                    line.quantity,
                    `Venta Factura ${invoiceNumber}`,
                    product.id,
                    warehouseId
                ]);
            }
            const total = subtotal + ivaAmount;
            const [accounts] = await conn.query("SELECT id, code FROM accounts WHERE code IN ('1.1.3.01', '4.1.1', '2.1.3.01', '5.1.1', '1.1.5')");
            const arAccount = accounts.find(a => a.code === '1.1.3.01');
            const salesAccount = accounts.find(a => a.code === '4.1.1');
            const ivaAccount = accounts.find(a => a.code === '2.1.3.01');
            const costAccount = accounts.find(a => a.code === '5.1.1');
            const invAccount = accounts.find(a => a.code === '1.1.5');
            if (!arAccount || !salesAccount || !ivaAccount || !costAccount || !invAccount) {
                throw new common_1.InternalServerErrorException('Faltan cuentas contables maestras.');
            }
            const journalEntryId = crypto.randomUUID();
            await conn.query('INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)', [journalEntryId, new Date(), `Venta Factura ${invoiceNumber}`, invoiceNumber, dto.userId || null]);
            const journalLines = [
                [crypto.randomUUID(), journalEntryId, arAccount.id, total, 0, null],
                [crypto.randomUUID(), journalEntryId, salesAccount.id, 0, subtotal, null],
                ...(ivaAmount > 0 ? [[crypto.randomUUID(), journalEntryId, ivaAccount.id, 0, ivaAmount, null]] : []),
                [crypto.randomUUID(), journalEntryId, costAccount.id, totalCost, 0, null],
                [crypto.randomUUID(), journalEntryId, invAccount.id, 0, totalCost, null]
            ];
            if (journalLines.length > 0) {
                await conn.query('INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?', [journalLines]);
            }
            const invoiceId = crypto.randomUUID();
            const pMethod = dto.paymentMethod || 'CASH';
            await conn.query('INSERT INTO invoices (id, invoiceNumber, subtotal, ivaAmount, total, paymentMethod, contactId, emissionPointId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [invoiceId, invoiceNumber, subtotal, ivaAmount, total, pMethod, dto.contactId, emissionPoint.id]);
            await conn.query('UPDATE journal_entries SET invoiceId = ? WHERE id = ?', [invoiceId, journalEntryId]);
            const finalInvoiceLines = invoiceLinesData.map(l => { l[1] = invoiceId; return l; });
            await conn.query('INSERT INTO invoice_lines (id, invoiceId, productId, quantity, unitPrice, total) VALUES ?', [finalInvoiceLines]);
            await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES ?', [inventoryTransactionsData]);
            await conn.commit();
            return { id: invoiceId, invoiceNumber, total };
        }
        catch (error) {
            await conn.rollback();
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al generar factura: ' + error.message);
        }
        finally {
            conn.release();
        }
    }
    async findAll() {
        const [rows] = await this.pool.query(`SELECT i.*, c.name as "contactName", ep.code as "emissionPointCode" 
       FROM invoices i 
       JOIN contacts c ON i.contactId = c.id 
       JOIN emission_points ep ON i.emissionPointId = ep.id
       ORDER BY i.invoiceNumber DESC`);
        return rows.map(r => ({
            ...r,
            contact: { name: r.contactName },
            emissionPoint: { code: r.emissionPointCode }
        }));
    }
    async seedBilling() {
        return { message: 'Use seed_mock_data.sql para inicializar datos (ya no se hace desde aquí)' };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map