import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateProductDto } from './dto/create-product.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(dto: CreateProductDto) {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT id FROM products WHERE code = ?',
      [dto.code]
    );
    if (existing.length > 0) {
      throw new BadRequestException('El código del producto ya existe');
    }

    const id = crypto.randomUUID();
    await this.pool.query(
      'INSERT INTO products (id, code, name, description, cost, price, hasIva, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, dto.code, dto.name, dto.description, dto.cost, dto.price, dto.hasIva, dto.stock || 0]
    );

    return { id, ...dto };
  }

  async update(id: string, dto: CreateProductDto) {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT code FROM products WHERE id = ?',
      [id]
    );
    if (existing.length === 0) throw new BadRequestException('Producto no encontrado');

    if (dto.code !== existing[0].code) {
      const [codeTaken] = await this.pool.query<RowDataPacket[]>(
        'SELECT id FROM products WHERE code = ?',
        [dto.code]
      );
      if (codeTaken.length > 0) throw new BadRequestException('El nuevo código SKU ya existe');
    }

    await this.pool.query(
      'UPDATE products SET code = ?, name = ?, description = ?, cost = ?, price = ?, hasIva = ?, stock = ? WHERE id = ?',
      [dto.code, dto.name, dto.description, dto.cost, dto.price, dto.hasIva, dto.stock, id]
    );

    return { id, ...dto };
  }

  async remove(id: string) {
    try {
      await this.pool.query('DELETE FROM products WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      throw new BadRequestException('No se puede eliminar el producto porque ya tiene movimientos en el Kardex o Facturas.');
    }
  }

  async findAll() {
    const [rows] = await this.pool.query<RowDataPacket[]>('SELECT id, code, name, description, cost, price, hasIva AS "hasIva", stock FROM products ORDER BY name ASC');
    return rows;
  }

  async getNextSku() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT code FROM products WHERE code LIKE 'PROD-%' ORDER BY code DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return { sku: 'PROD-0001' };
    }

    const lastCode = rows[0].code;
    const parts = lastCode.split('-');
    if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num)) {
        const nextNum = (num + 1).toString().padStart(4, '0');
        return { sku: `PROD-${nextNum}` };
      }
    }
    
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return { sku: `PROD-${random}` };
  }

  async seedWarehouse() {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT id, code, name FROM warehouses WHERE code = ?',
      ['BOD-01']
    );

    if (existing.length === 0) {
      const id = crypto.randomUUID();
      await this.pool.query(
        'INSERT INTO warehouses (id, code, name) VALUES (?, ?, ?)',
        [id, 'BOD-01', 'Bodega Principal Matriz']
      );
      return { id, code: 'BOD-01', name: 'Bodega Principal Matriz' };
    }
    return existing[0];
  }
}
