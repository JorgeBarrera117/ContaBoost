import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('inventario.editar')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('inventario.editar')
  update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('inventario.editar')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get()
  @RequirePermissions('inventario.ver')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('sku/next')
  @RequirePermissions('inventario.ver')
  getNextSku() {
    return this.productsService.getNextSku();
  }

  @Post('seed-warehouse')
  seedWarehouse() {
    return this.productsService.seedWarehouse();
  }
}
