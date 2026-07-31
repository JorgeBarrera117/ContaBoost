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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
let DashboardService = class DashboardService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async getSummary() {
        const [salesAgg] = await this.pool.query('SELECT SUM(total) as "totalSales" FROM invoices');
        const [expensesAgg] = await this.pool.query('SELECT SUM(total) as "totalExpenses" FROM purchases');
        const totalSales = Number(salesAgg[0].totalSales || 0);
        const totalExpenses = Number(expensesAgg[0].totalExpenses || 0);
        const netIncome = totalSales - totalExpenses;
        const [lastInvoices] = await this.pool.query(`SELECT i.id, c.name as "contactName", i.date, i.total 
       FROM invoices i 
       JOIN contacts c ON i.contactId = c.id 
       ORDER BY i.date DESC LIMIT 5`);
        const [lastPurchases] = await this.pool.query(`SELECT p.id, c.name as "contactName", p.date, p.total 
       FROM purchases p 
       JOIN contacts c ON p.contactId = c.id 
       ORDER BY p.date DESC LIMIT 5`);
        const transactions = [
            ...lastInvoices.map(inv => ({
                id: inv.id,
                contactName: inv.contactName,
                date: new Date(inv.date),
                category: 'Venta',
                amount: Number(inv.total),
                type: 'IN'
            })),
            ...lastPurchases.map(pur => ({
                id: pur.id,
                contactName: pur.contactName,
                date: new Date(pur.date),
                category: 'Compra',
                amount: Number(pur.total),
                type: 'OUT'
            }))
        ];
        transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        const recentTransactions = transactions.slice(0, 6);
        const [lowStockItems] = await this.pool.query('SELECT id, code, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5');
        return {
            kpis: {
                totalSales,
                totalExpenses,
                netIncome
            },
            recentTransactions,
            lowStockItems
        };
    }
    async getEmployeeSummary(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let cashSession = null;
        if (userId) {
            const [sessions] = await this.pool.query("SELECT id, status, initialBalance FROM cash_register_sessions WHERE userId = ? AND status = 'OPEN' ORDER BY openedAt DESC LIMIT 1", [userId]);
            if (sessions.length > 0) {
                cashSession = sessions[0];
            }
        }
        const [todayInvoices] = await this.pool.query(`SELECT i.id, i.invoiceNumber, i.date, i.total, i.paymentMethod, c.name as "contactName"
       FROM invoices i
       JOIN contacts c ON i.contactId = c.id
       WHERE i.date >= ?
       ORDER BY i.date DESC`, [today]);
        const invoiceIds = todayInvoices.map(i => i.id);
        let todayLines = [];
        if (invoiceIds.length > 0) {
            const [lines] = await this.pool.query(`SELECT invoiceId, quantity FROM invoice_lines WHERE invoiceId IN (?)`, [invoiceIds]);
            todayLines = lines;
        }
        let totalCash = 0;
        let totalCard = 0;
        let totalItems = 0;
        const salesByHour = [
            { time: '08:00', amount: 0 },
            { time: '10:00', amount: 0 },
            { time: '12:00', amount: 0 },
            { time: '14:00', amount: 0 },
            { time: '16:00', amount: 0 },
            { time: '18:00', amount: 0 }
        ];
        todayInvoices.forEach(inv => {
            const amount = Number(inv.total);
            if (inv.paymentMethod === 'CASH')
                totalCash += amount;
            else if (inv.paymentMethod === 'CARD')
                totalCard += amount;
            const itemsCount = todayLines
                .filter(l => l.invoiceId === inv.id)
                .reduce((acc, line) => acc + line.quantity, 0);
            totalItems += itemsCount;
            const dateObj = new Date(inv.date);
            const hour = dateObj.getHours();
            if (hour >= 8 && hour < 10)
                salesByHour[0].amount += amount;
            else if (hour >= 10 && hour < 12)
                salesByHour[1].amount += amount;
            else if (hour >= 12 && hour < 14)
                salesByHour[2].amount += amount;
            else if (hour >= 14 && hour < 16)
                salesByHour[3].amount += amount;
            else if (hour >= 16 && hour < 18)
                salesByHour[4].amount += amount;
            else if (hour >= 18)
                salesByHour[5].amount += amount;
        });
        const totalSales = totalCash + totalCard;
        const transactionCount = todayInvoices.length;
        const averageTicket = transactionCount > 0 ? totalSales / transactionCount : 0;
        const itemsPerSale = transactionCount > 0 ? totalItems / transactionCount : 0;
        const recentSales = todayInvoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            contactName: inv.contactName,
            date: new Date(inv.date),
            itemsCount: todayLines
                .filter(l => l.invoiceId === inv.id)
                .reduce((acc, line) => acc + line.quantity, 0),
            amount: Number(inv.total),
            paymentMethod: inv.paymentMethod
        }));
        return {
            cashSession: cashSession ? {
                id: cashSession.id,
                status: cashSession.status,
                initialBalance: Number(cashSession.initialBalance),
                currentBalance: Number(cashSession.initialBalance) + totalCash
            } : null,
            sales: {
                total: totalSales,
                cash: totalCash,
                card: totalCard,
                count: transactionCount,
                averageTicket,
                itemsPerSale
            },
            salesByHour,
            recentSales
        };
    }
    async globalSearch(query) {
        if (!query || query.length < 2)
            return [];
        const likeQuery = `%${query}%`;
        const results = [];
        const [contacts] = await this.pool.query('SELECT id, name, identification FROM contacts WHERE name LIKE ? OR identification LIKE ? LIMIT 4', [likeQuery, likeQuery]);
        contacts.forEach(c => results.push({ type: 'contact', title: c.name, subtitle: `ID: ${c.identification}`, url: '/contacts' }));
        const [products] = await this.pool.query('SELECT id, name, code, stock FROM products WHERE name LIKE ? OR code LIKE ? LIMIT 4', [likeQuery, likeQuery]);
        products.forEach(p => results.push({ type: 'product', title: p.name, subtitle: `Cod: ${p.code} | Stock: ${p.stock}`, url: '/products' }));
        const [invoices] = await this.pool.query('SELECT id, invoiceNumber, total FROM invoices WHERE invoiceNumber LIKE ? LIMIT 4', [likeQuery]);
        invoices.forEach(i => results.push({ type: 'invoice', title: `Factura ${i.invoiceNumber}`, subtitle: `Total: $${Number(i.total).toFixed(2)}`, url: '/invoices' }));
        return results;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_POOL')),
    __metadata("design:paramtypes", [Object])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map