import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('reports')
@RequirePermissions('reportes.ver')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  getTrialBalance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getTrialBalance(startDate, endDate);
  }

  @Get('profit-loss')
  getProfitAndLoss(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getProfitAndLoss(startDate, endDate);
  }

  @Get('balance-sheet')
  getBalanceSheet(
    @Query('endDate') endDate?: string
  ) {
    return this.reportsService.getBalanceSheet(endDate);
  }
}
