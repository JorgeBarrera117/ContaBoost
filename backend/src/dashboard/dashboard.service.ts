import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class DashboardService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async getSummary() {
    // 1. Calcular KPIs (Ventas, Gastos, Utilidad)
    const [salesAgg] = await this.pool.query<RowDataPacket[]>('SELECT SUM(total) as totalSales FROM invoices');
    const [expensesAgg] = await this.pool.query<RowDataPacket[]>('SELECT SUM(total) as totalExpenses FROM purchases');

    const totalSales = Number(salesAgg[0].totalSales || 0);
    const totalExpenses = Number(expensesAgg[0].totalExpenses || 0);
    const netIncome = totalSales - totalExpenses;

    // 2. Últimas Transacciones (Ventas y Compras combinadas)
    const [lastInvoices] = await this.pool.query<RowDataPacket[]>(
      `SELECT i.id, c.name as contactName, i.date, i.total 
       FROM invoices i 
       JOIN contacts c ON i.contactId = c.id 
       ORDER BY i.date DESC LIMIT 5`
    );

    const [lastPurchases] = await this.pool.query<RowDataPacket[]>(
      `SELECT p.id, c.name as contactName, p.date, p.total 
       FROM purchases p 
       JOIN contacts c ON p.contactId = c.id 
       ORDER BY p.date DESC LIMIT 5`
    );

    const transactions = [
      ...lastInvoices.map(inv => ({
        id: inv.id,
        contactName: inv.contactName,
        date: new Date(inv.date),
        category: 'Venta',
        amount: Number(inv.total),
        type: 'IN' // Ingreso
      })),
      ...lastPurchases.map(pur => ({
        id: pur.id,
        contactName: pur.contactName,
        date: new Date(pur.date),
        category: 'Compra',
        amount: Number(pur.total),
        type: 'OUT' // Egreso
      }))
    ];

    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentTransactions = transactions.slice(0, 6);

    // 3. Stock Bajo
    const [lowStockItems] = await this.pool.query<RowDataPacket[]>(
      'SELECT id, code, name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5'
    );

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

  async getEmployeeSummary(userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let cashSession = null;
    if (userId) {
      const [sessions] = await this.pool.query<RowDataPacket[]>(
        "SELECT id, status, initialBalance FROM cash_register_sessions WHERE userId = ? AND status = 'OPEN' ORDER BY openedAt DESC LIMIT 1",
        [userId]
      );
      if (sessions.length > 0) {
        cashSession = sessions[0];
      }
    }

    const [todayInvoices] = await this.pool.query<RowDataPacket[]>(
      `SELECT i.id, i.invoiceNumber, i.date, i.total, i.paymentMethod, c.name as contactName
       FROM invoices i
       JOIN contacts c ON i.contactId = c.id
       WHERE i.date >= ?
       ORDER BY i.date DESC`,
      [today]
    );

    // Obtener lineas de las facturas de hoy
    const invoiceIds = todayInvoices.map(i => i.id);
    let todayLines: RowDataPacket[] = [];
    if (invoiceIds.length > 0) {
      const [lines] = await this.pool.query<RowDataPacket[]>(
        `SELECT invoiceId, quantity FROM invoice_lines WHERE invoiceId IN (?)`,
        [invoiceIds]
      );
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
      if (inv.paymentMethod === 'CASH') totalCash += amount;
      else if (inv.paymentMethod === 'CARD') totalCard += amount;
      
      const itemsCount = todayLines
        .filter(l => l.invoiceId === inv.id)
        .reduce((acc, line) => acc + line.quantity, 0);
      
      totalItems += itemsCount;

      const dateObj = new Date(inv.date);
      const hour = dateObj.getHours();
      
      if (hour >= 8 && hour < 10) salesByHour[0].amount += amount;
      else if (hour >= 10 && hour < 12) salesByHour[1].amount += amount;
      else if (hour >= 12 && hour < 14) salesByHour[2].amount += amount;
      else if (hour >= 14 && hour < 16) salesByHour[3].amount += amount;
      else if (hour >= 16 && hour < 18) salesByHour[4].amount += amount;
      else if (hour >= 18) salesByHour[5].amount += amount;
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

  async globalSearch(query: string) {
    if (!query || query.length < 2) return [];

    const likeQuery = `%${query}%`;
    const results: any[] = [];

    // Contactos
    const [contacts] = await this.pool.query<RowDataPacket[]>(
      'SELECT id, name, identification FROM contacts WHERE name LIKE ? OR identification LIKE ? LIMIT 4',
      [likeQuery, likeQuery]
    );
    contacts.forEach(c => results.push({ type: 'contact', title: c.name, subtitle: `ID: ${c.identification}`, url: '/contacts' }));

    // Productos
    const [products] = await this.pool.query<RowDataPacket[]>(
      'SELECT id, name, code, stock FROM products WHERE name LIKE ? OR code LIKE ? LIMIT 4',
      [likeQuery, likeQuery]
    );
    products.forEach(p => results.push({ type: 'product', title: p.name, subtitle: `Cod: ${p.code} | Stock: ${p.stock}`, url: '/products' }));

    // Facturas
    const [invoices] = await this.pool.query<RowDataPacket[]>(
      'SELECT id, invoiceNumber, total FROM invoices WHERE invoiceNumber LIKE ? LIMIT 4',
      [likeQuery]
    );
    invoices.forEach(i => results.push({ type: 'invoice', title: `Factura ${i.invoiceNumber}`, subtitle: `Total: $${Number(i.total).toFixed(2)}`, url: '/invoices' }));

    return results;
  }
}
