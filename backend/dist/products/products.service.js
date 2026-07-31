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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let ProductsService = class ProductsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(dto) {
        const [existing] = await this.pool.query('SELECT id FROM products WHERE code = ?', [dto.code]);
        if (existing.length > 0) {
            throw new common_1.BadRequestException('El código del producto ya existe');
        }
        const id = crypto.randomUUID();
        await this.pool.query('INSERT INTO products (id, code, name, description, cost, price, hasIva, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, dto.code, dto.name, dto.description, dto.cost, dto.price, dto.hasIva, dto.stock || 0]);
        return { id, ...dto };
    }
    async update(id, dto) {
        const [existing] = await this.pool.query('SELECT code FROM products WHERE id = ?', [id]);
        if (existing.length === 0)
            throw new common_1.BadRequestException('Producto no encontrado');
        if (dto.code !== existing[0].code) {
            const [codeTaken] = await this.pool.query('SELECT id FROM products WHERE code = ?', [dto.code]);
            if (codeTaken.length > 0)
                throw new common_1.BadRequestException('El nuevo código SKU ya existe');
        }
        await this.pool.query('UPDATE products SET code = ?, name = ?, description = ?, cost = ?, price = ?, hasIva = ?, stock = ? WHERE id = ?', [dto.code, dto.name, dto.description, dto.cost, dto.price, dto.hasIva, dto.stock, id]);
        return { id, ...dto };
    }
    async remove(id) {
        try {
            await this.pool.query('DELETE FROM products WHERE id = ?', [id]);
            return { id };
        }
        catch (error) {
            throw new common_1.BadRequestException('No se puede eliminar el producto porque ya tiene movimientos en el Kardex o Facturas.');
        }
    }
    async findAll() {
        const [rows] = await this.pool.query('SELECT id, code, name, description, cost, price, hasIva AS "hasIva", stock FROM products ORDER BY name ASC');
        return rows;
    }
    async getNextSku() {
        const [rows] = await this.pool.query("SELECT code FROM products WHERE code LIKE 'PROD-%' ORDER BY code DESC LIMIT 1");
        if (rows.length === 0) {
            return { sku: 'PROD-0001' };
        }
        const lastCode = rows[0].code;
        const parts = lastCode.split('-');
        if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num)) {
                const nextNum = (num + 1).toString().padStart(4, '0');
                return { sku: `PROD-${nextNum}` };
            }
        }
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return { sku: `PROD-${random}` };
    }
    async seedWarehouse() {
        const [existing] = await this.pool.query('SELECT id, code, name FROM warehouses WHERE code = ?', ['BOD-01']);
        if (existing.length === 0) {
            const id = crypto.randomUUID();
            await this.pool.query('INSERT INTO warehouses (id, code, name) VALUES (?, ?, ?)', [id, 'BOD-01', 'Bodega Principal Matriz']);
            return { id, code: 'BOD-01', name: 'Bodega Principal Matriz' };
        }
        return existing[0];
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map