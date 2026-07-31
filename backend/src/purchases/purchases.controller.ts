import { Controller, Get, Post, Body } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @RequirePermissions('compras.crear')
  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(dto);
  }

  @RequirePermissions('compras.ver')
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }
}
