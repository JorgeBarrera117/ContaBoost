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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let JournalService = class JournalService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(createDto) {
        if (!createDto.lines || createDto.lines.length === 0) {
            throw new common_1.BadRequestException('El asiento contable debe tener al menos una línea.');
        }
        let totalDebit = 0;
        let totalCredit = 0;
        createDto.lines.forEach(line => {
            totalDebit += line.debit;
            totalCredit += line.credit;
        });
        totalDebit = Math.round(totalDebit * 100) / 100;
        totalCredit = Math.round(totalCredit * 100) / 100;
        if (totalDebit !== totalCredit) {
            throw new common_1.BadRequestException(`El asiento no cuadra. Total Debe: ${totalDebit}, Total Haber: ${totalCredit}`);
        }
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            const journalEntryId = crypto.randomUUID();
            await conn.query('INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)', [journalEntryId, new Date(createDto.date), createDto.description, createDto.reference || null, createDto.userId || null]);
            const linesData = createDto.lines.map(line => [
                crypto.randomUUID(),
                journalEntryId,
                line.accountId,
                line.debit,
                line.credit,
                line.description || null
            ]);
            await conn.query('INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?', [linesData]);
            await conn.commit();
            return { id: journalEntryId, description: createDto.description };
        }
        catch (error) {
            await conn.rollback();
            throw new common_1.InternalServerErrorException('Error al generar asiento contable: ' + error.message);
        }
        finally {
            conn.release();
        }
    }
    async findAll() {
        const [entries] = await this.pool.query(`SELECT je.*, u.nombre as "userName" 
       FROM journal_entries je
       LEFT JOIN usuarios u ON je.userId = u.id
       ORDER BY je.date DESC`);
        const [lines] = await this.pool.query(`SELECT jl.*, a.name as "accountName", a.code as "accountCode"
       FROM journal_lines jl
       JOIN accounts a ON jl.accountId = a.id`);
        return entries.map(entry => {
            return {
                ...entry,
                user: { name: entry.userName },
                lines: lines
                    .filter(line => line.journalEntryId === entry.id)
                    .map(line => ({
                    ...line,
                    account: { name: line.accountName, code: line.accountCode }
                }))
            };
        });
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], JournalService);
//# sourceMappingURL=journal.service.js.map