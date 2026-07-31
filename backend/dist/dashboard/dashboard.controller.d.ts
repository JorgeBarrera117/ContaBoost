import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
        lowStockItems: import("mysql2").RowDataPacket[];
    }>;
    getEmployeeSummary(): Promise<{
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
    globalSearch(q: string): Promise<any[]>;
}
