import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('dashboard')
@RequirePermissions('dashboard.ver')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('employee-summary')
  getEmployeeSummary() {
    return this.dashboardService.getEmployeeSummary();
  }

  @Get('search')
  globalSearch(@Query('q') q: string) {
    return this.dashboardService.globalSearch(q);
  }
}
