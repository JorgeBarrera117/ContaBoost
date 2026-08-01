"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
let ReportsService = class ReportsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async getTrialBalance(startDate, endDate) {
        let dateFilter = '';
        const queryParams = [];
        if (startDate || endDate) {
            if (startDate && endDate) {
                dateFilter = 'AND je.date >= ? AND je.date <= ?';
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                queryParams.push(new Date(startDate), end);
            }
            else if (startDate) {
                dateFilter = 'AND je.date >= ?';
                queryParams.push(new Date(startDate));
            }
            else if (endDate) {
                dateFilter = 'AND je.date <= ?';
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                queryParams.push(end);
            }
        }
        const query = `
      SELECT 
        a.id as "accountId", 
        a.code as "accountCode", 
        a.name as "accountName", 
        a.type as "accountType",
        SUM(jl.debit) as "totalDebit", 
        SUM(jl.credit) as "totalCredit"
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journalEntryId = je.id
      JOIN accounts a ON jl.accountId = a.id
      WHERE jl.isDeleted = FALSE ${dateFilter}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;
        const [rows] = await this.pool.query(query, queryParams);
        let totalDebit = 0;
        let totalCredit = 0;
        const report = rows.map(row => {
            const debit = Number(row.totalDebit || 0);
            const credit = Number(row.totalCredit || 0);
            totalDebit += debit;
            totalCredit += credit;
            let balance = 0;
            if (row.accountType === 'ASSET' || row.accountType === 'EXPENSE') {
                balance = debit - credit;
            }
            else {
                balance = credit - debit;
            }
            return {
                accountId: row.accountId,
                accountCode: row.accountCode,
                accountName: row.accountName,
                accountType: row.accountType,
                debit,
                credit,
                balance
            };
        });
        totalDebit = Math.round(totalDebit * 100) / 100;
        totalCredit = Math.round(totalCredit * 100) / 100;
        return {
            lines: report,
            summary: {
                totalDebit,
                totalCredit,
                isBalanced: totalDebit === totalCredit
            }
        };
    }
    async getProfitAndLoss(startDate, endDate) {
        let dateFilter = '';
        const queryParams = [];
        if (startDate || endDate) {
            if (startDate && endDate) {
                dateFilter = 'AND je.date >= ? AND je.date <= ?';
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                queryParams.push(new Date(startDate), end);
            }
            else if (startDate) {
                dateFilter = 'AND je.date >= ?';
                queryParams.push(new Date(startDate));
            }
            else if (endDate) {
                dateFilter = 'AND je.date <= ?';
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                queryParams.push(end);
            }
        }
        const query = `
      SELECT 
        a.id as "accountId", 
        a.code as "accountCode", 
        a.name as "accountName", 
        a.type as "accountType",
        SUM(jl.debit) as "totalDebit", 
        SUM(jl.credit) as "totalCredit"
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journalEntryId = je.id
      JOIN accounts a ON jl.accountId = a.id
      WHERE jl.isDeleted = FALSE AND a.type IN ('REVENUE', 'EXPENSE') ${dateFilter}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;
        const [rows] = await this.pool.query(query, queryParams);
        const incomeLines = [];
        const expenseLines = [];
        let totalIncome = 0;
        let totalExpense = 0;
        rows.forEach(row => {
            const debit = Number(row.totalDebit || 0);
            const credit = Number(row.totalCredit || 0);
            if (row.accountType === 'REVENUE') {
                const balance = credit - debit;
                totalIncome += balance;
                incomeLines.push({
                    accountId: row.accountId,
                    accountCode: row.accountCode,
                    accountName: row.accountName,
                    balance
                });
            }
            else if (row.accountType === 'EXPENSE') {
                const balance = debit - credit;
                totalExpense += balance;
                expenseLines.push({
                    accountId: row.accountId,
                    accountCode: row.accountCode,
                    accountName: row.accountName,
                    balance
                });
            }
        });
        totalIncome = Math.round(totalIncome * 100) / 100;
        totalExpense = Math.round(totalExpense * 100) / 100;
        const netIncome = Math.round((totalIncome - totalExpense) * 100) / 100;
        return {
            incomeLines,
            expenseLines,
            summary: {
                totalIncome,
                totalExpense,
                netIncome
            }
        };
    }
    async getBalanceSheet(endDate) {
        let dateFilter = '';
        const queryParams = [];
        if (endDate) {
            dateFilter = 'AND je.date <= ?';
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            queryParams.push(end);
        }
        const query = `
      SELECT 
        a.id as "accountId", 
        a.code as "accountCode", 
        a.name as "accountName", 
        a.type as "accountType",
        SUM(jl.debit) as "totalDebit", 
        SUM(jl.credit) as "totalCredit"
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journalEntryId = je.id
      JOIN accounts a ON jl.accountId = a.id
      WHERE jl.isDeleted = FALSE ${dateFilter}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;
        const [rows] = await this.pool.query(query, queryParams);
        const assetLines = [];
        const liabilityLines = [];
        const equityLines = [];
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let totalIncome = 0;
        let totalExpense = 0;
        rows.forEach(row => {
            const debit = Number(row.totalDebit || 0);
            const credit = Number(row.totalCredit || 0);
            if (row.accountType === 'ASSET') {
                const balance = debit - credit;
                totalAssets += balance;
                assetLines.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, balance });
            }
            else if (row.accountType === 'LIABILITY') {
                const balance = credit - debit;
                totalLiabilities += balance;
                liabilityLines.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, balance });
            }
            else if (row.accountType === 'EQUITY') {
                const balance = credit - debit;
                totalEquity += balance;
                equityLines.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, balance });
            }
            else if (row.accountType === 'REVENUE') {
                totalIncome += (credit - debit);
            }
            else if (row.accountType === 'EXPENSE') {
                totalExpense += (debit - credit);
            }
        });
        const netIncome = totalIncome - totalExpense;
        totalEquity += netIncome;
        if (netIncome !== 0) {
            equityLines.push({
                accountId: 'net-income-auto',
                accountCode: '3.99.99',
                accountName: 'Resultado del Ejercicio (Utilidad/Pérdida)',
                balance: netIncome
            });
        }
        totalAssets = Math.round(totalAssets * 100) / 100;
        totalLiabilities = Math.round(totalLiabilities * 100) / 100;
        totalEquity = Math.round(totalEquity * 100) / 100;
        const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;
        return {
            assetLines,
            liabilityLines,
            equityLines,
            summary: {
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalLiabilitiesAndEquity,
                isBalanced: totalAssets === totalLiabilitiesAndEquity
            }
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map