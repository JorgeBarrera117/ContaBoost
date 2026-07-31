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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let ContactsService = class ContactsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(dto) {
        const [existing] = await this.pool.query('SELECT id FROM contacts WHERE identification = ?', [dto.identification]);
        if (existing.length > 0) {
            throw new common_1.BadRequestException('La identificación ya está registrada');
        }
        const id = crypto.randomUUID();
        await this.pool.query('INSERT INTO contacts (id, identification, name, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)', [id, dto.identification, dto.name, dto.address, dto.phone, dto.email]);
        return { id, ...dto };
    }
    async update(id, dto) {
        const [existing] = await this.pool.query('SELECT identification FROM contacts WHERE id = ?', [id]);
        if (existing.length === 0) {
            throw new common_1.BadRequestException('Contacto no encontrado');
        }
        if (dto.identification !== existing[0].identification) {
            const [idTaken] = await this.pool.query('SELECT id FROM contacts WHERE identification = ?', [dto.identification]);
            if (idTaken.length > 0) {
                throw new common_1.BadRequestException('La nueva identificación ya está registrada');
            }
        }
        await this.pool.query('UPDATE contacts SET identification = ?, name = ?, address = ?, phone = ?, email = ? WHERE id = ?', [dto.identification, dto.name, dto.address, dto.phone, dto.email, id]);
        return { id, ...dto };
    }
    async remove(id) {
        try {
            await this.pool.query('DELETE FROM contacts WHERE id = ?', [id]);
            return { id };
        }
        catch (error) {
            throw new common_1.BadRequestException('No se puede eliminar el contacto porque tiene transacciones asociadas.');
        }
    }
    async findAll() {
        const [rows] = await this.pool.query('SELECT * FROM contacts ORDER BY name ASC');
        return rows;
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map