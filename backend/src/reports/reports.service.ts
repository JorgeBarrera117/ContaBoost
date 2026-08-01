import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class ReportsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async getTrialBalance(startDate?: string, endDate?: string) {
    let dateFilter = '';
    const queryParams: any[] = [];

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = 'AND je.date >= ? AND je.date <= ?';
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        queryParams.push(new Date(startDate), end);
      } else if (startDate) {
        dateFilter = 'AND je.date >= ?';
        queryParams.push(new Date(startDate));
      } else if (endDate) {
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

    const [rows] = await this.pool.query<RowDataPacket[]>(query, queryParams);

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
      } else {
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

  async getProfitAndLoss(startDate?: string, endDate?: string) {
    let dateFilter = '';
    const queryParams: any[] = [];

    if (startDate || endDate) {
      if (startDate && endDate) {
        dateFilter = 'AND je.date >= ? AND je.date <= ?';
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        queryParams.push(new Date(startDate), end);
      } else if (startDate) {
        dateFilter = 'AND je.date >= ?';
        queryParams.push(new Date(startDate));
      } else if (endDate) {
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

    const [rows] = await this.pool.query<RowDataPacket[]>(query, queryParams);

    const incomeLines: any[] = [];
    const expenseLines: any[] = [];
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
      } else if (row.accountType === 'EXPENSE') {
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

  async getBalanceSheet(endDate?: string) {
    let dateFilter = '';
    const queryParams: any[] = [];

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

    const [rows] = await this.pool.query<RowDataPacket[]>(query, queryParams);

    const assetLines: any[] = [];
    const liabilityLines: any[] = [];
    const equityLines: any[] = [];
    
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
      } else if (row.accountType === 'LIABILITY') {
        const balance = credit - debit;
        totalLiabilities += balance;
        liabilityLines.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, balance });
      } else if (row.accountType === 'EQUITY') {
        const balance = credit - debit;
        totalEquity += balance;
        equityLines.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, balance });
      } else if (row.accountType === 'REVENUE') {
        totalIncome += (credit - debit);
      } else if (row.accountType === 'EXPENSE') {
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
}
