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
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let PurchasesService = class PurchasesService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(dto) {
        const [existing] = await this.pool.query('SELECT id FROM purchases WHERE purchaseNumber = ?', [dto.purchaseNumber]);
        if (existing.length > 0) {
            throw new common_1.BadRequestException('El número de factura de compra ya está registrado.');
        }
        if (!dto.lines || dto.lines.length === 0) {
            throw new common_1.BadRequestException('La compra debe tener al menos un producto.');
        }
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            let subtotal = 0;
            let ivaAmount = 0;
            const linesData = [];
            const inventoryTransactionsData = [];
            let warehouseId;
            const [warehouses] = await conn.query('SELECT id FROM warehouses LIMIT 1');
            if (warehouses.length > 0) {
                warehouseId = warehouses[0].id;
            }
            else {
                warehouseId = crypto.randomUUID();
                await conn.query('INSERT INTO warehouses (id, code, name) VALUES (?, ?, ?)', [warehouseId, 'MATRIZ', 'Bodega Matriz']);
            }
            for (const line of dto.lines) {
                const [products] = await conn.query('SELECT id, hasIva FROM products WHERE id = ? FOR UPDATE', [line.productId]);
                if (products.length === 0)
                    throw new common_1.BadRequestException(`Producto no encontrado: ${line.productId}`);
                const product = products[0];
                const totalLine = line.quantity * line.unitCost;
                subtotal += totalLine;
                if (product.hasIva) {
                    ivaAmount += totalLine * 0.15;
                }
                await conn.query('UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?', [line.quantity, line.unitCost, product.id]);
                linesData.push([
                    crypto.randomUUID(),
                    null,
                    product.id,
                    line.quantity,
                    line.unitCost,
                    totalLine
                ]);
                inventoryTransactionsData.push([
                    crypto.randomUUID(),
                    'IN',
                    line.quantity,
                    `Compra Fac. ${dto.purchaseNumber}`,
                    product.id,
                    warehouseId
                ]);
            }
            const total = subtotal + ivaAmount;
            const [accounts] = await conn.query("SELECT id, code FROM accounts WHERE code IN ('1.1.5.01', '1.1.4.01', '2.1.1.01')");
            const inventoryAccount = accounts.find(a => a.code === '1.1.5.01');
            const ivaAccount = accounts.find(a => a.code === '1.1.4.01');
            const suppliersAccount = accounts.find(a => a.code === '2.1.1.01');
            if (!inventoryAccount || !ivaAccount || !suppliersAccount) {
                throw new common_1.BadRequestException('Faltan cuentas contables base (Inventario, IVA compras, Proveedores).');
            }
            const journalEntryId = crypto.randomUUID();
            await conn.query('INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)', [journalEntryId, new Date(), `Compra según Fac. ${dto.purchaseNumber}`, dto.purchaseNumber, null]);
            const journalLines = [
                [crypto.randomUUID(), journalEntryId, inventoryAccount.id, subtotal, 0, 'Ingreso de mercadería'],
                ...(ivaAmount > 0 ? [[crypto.randomUUID(), journalEntryId, ivaAccount.id, ivaAmount, 0, 'IVA Compras']] : []),
                [crypto.randomUUID(), journalEntryId, suppliersAccount.id, 0, total, 'Cuentas por pagar']
            ];
            await conn.query('INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?', [journalLines]);
            const purchaseId = crypto.randomUUID();
            await conn.query('INSERT INTO purchases (id, purchaseNumber, subtotal, ivaAmount, total, contactId) VALUES (?, ?, ?, ?, ?, ?)', [purchaseId, dto.purchaseNumber, subtotal, ivaAmount, total, dto.contactId]);
            await conn.query('UPDATE journal_entries SET purchaseId = ? WHERE id = ?', [purchaseId, journalEntryId]);
            const finalLines = linesData.map(l => { l[1] = purchaseId; return l; });
            await conn.query('INSERT INTO purchase_lines (id, purchaseId, productId, quantity, unitCost, total) VALUES ?', [finalLines]);
            await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES ?', [inventoryTransactionsData]);
            await conn.commit();
            return { id: purchaseId, purchaseNumber: dto.purchaseNumber, total };
        }
        catch (error) {
            await conn.rollback();
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al generar compra: ' + error.message);
        }
        finally {
            conn.release();
        }
    }
    async findAll() {
        const [rows] = await this.pool.query(`SELECT p.*, c.name as "contactName" 
       FROM purchases p 
       JOIN contacts c ON p.contactId = c.id 
       ORDER BY p.date DESC`);
        return rows.map(r => ({
            ...r,
            contact: { name: r.contactName }
        }));
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map