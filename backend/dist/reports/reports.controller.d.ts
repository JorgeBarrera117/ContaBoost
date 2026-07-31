import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getTrialBalance(startDate?: string, endDate?: string): Promise<{
        lines: {
            accountId: any;
            accountCode: any;
            accountName: any;
            accountType: any;
            debit: number;
            credit: number;
            balance: number;
        }[];
        summary: {
            totalDebit: number;
            totalCredit: number;
            isBalanced: boolean;
        };
    }>;
    getProfitAndLoss(startDate?: string, endDate?: string): Promise<{
        incomeLines: any[];
        expenseLines: any[];
        summary: {
            totalIncome: number;
            totalExpense: number;
            netIncome: number;
        };
    }>;
    getBalanceSheet(endDate?: string): Promise<{
        assetLines: any[];
        liabilityLines: any[];
        equityLines: any[];
        summary: {
            totalAssets: number;
            totalLiabilities: number;
            totalEquity: number;
            totalLiabilitiesAndEquity: number;
            isBalanced: boolean;
        };
    }>;
}
