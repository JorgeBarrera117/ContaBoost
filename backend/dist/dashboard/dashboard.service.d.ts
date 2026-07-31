import type { Pool, RowDataPacket } from 'mysql2/promise';
export declare class DashboardService {
    private pool;
    constructor(pool: Pool);
    getSummary(): Promise<{
        kpis: {
            totalSales: number;
            totalExpenses: number;
            netIncome: number;
        };
        recentTransactions: {
            id: any;
            contactName: any;
            date: Date;
            category: string;
            amount: number;
            type: string;
        }[];
        lowStockItems: RowDataPacket[];
    }>;
    getEmployeeSummary(userId?: string): Promise<{
        cashSession: {
            id: any;
            status: any;
            initialBalance: number;
            currentBalance: number;
        } | null;
        sales: {
            total: number;
            cash: number;
            card: number;
            count: number;
            averageTicket: number;
            itemsPerSale: number;
        };
        salesByHour: {
            time: string;
            amount: number;
        }[];
        recentSales: {
            id: any;
            invoiceNumber: any;
            contactName: any;
            date: Date;
            itemsCount: any;
            amount: number;
            paymentMethod: any;
        }[];
    }>;
    globalSearch(query: string): Promise<any[]>;
}
