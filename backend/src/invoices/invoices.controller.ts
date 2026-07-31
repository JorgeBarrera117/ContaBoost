import { Controller, Get, Post, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Public } from '../auth/public.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @RequirePermissions('ventas.crear')
  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  // Permite ver si tiene ver_todas o ver_propias (el frontend o backend puede filtrar luego, por ahora dejamos ver_todas)
  @RequirePermissions('ventas.ver_todas')
  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Post('seed-billing')
  seedBilling() {
    return this.invoicesService.seedBilling();
  }
}
