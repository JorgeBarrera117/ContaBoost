import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import * as crypto from 'crypto';

@Injectable()
export class PurchasesService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(dto: CreatePurchaseDto) {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT id FROM purchases WHERE purchaseNumber = ?',
      [dto.purchaseNumber]
    );
    
    if (existing.length > 0) {
      throw new BadRequestException('El número de factura de compra ya está registrado.');
    }

    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('La compra debe tener al menos un producto.');
    }

    const conn = await this.pool.getConnection();

    try {
      await conn.beginTransaction();

      // 1. Calculate totals
      let subtotal = 0;
      let ivaAmount = 0;
      
      const linesData = [];
      const inventoryTransactionsData = [];

      let warehouseId: string;
      const [warehouses] = await conn.query<RowDataPacket[]>('SELECT id FROM warehouses LIMIT 1');
      if (warehouses.length > 0) {
        warehouseId = warehouses[0].id;
      } else {
        warehouseId = crypto.randomUUID();
        await conn.query(
          'INSERT INTO warehouses (id, code, name) VALUES (?, ?, ?)',
          [warehouseId, 'MATRIZ', 'Bodega Matriz']
        );
      }

      for (const line of dto.lines) {
        const [products] = await conn.query<RowDataPacket[]>(
          'SELECT id, hasIva FROM products WHERE id = ? FOR UPDATE',
          [line.productId]
        );
        if (products.length === 0) throw new BadRequestException(`Producto no encontrado: ${line.productId}`);
        
        const product = products[0];
        const totalLine = line.quantity * line.unitCost;
        subtotal += totalLine;
        
        if (product.hasIva) {
          ivaAmount += totalLine * 0.15;
        }

        // Update product stock and cost
        await conn.query(
          'UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?',
          [line.quantity, line.unitCost, product.id]
        );

        linesData.push([
          crypto.randomUUID(),
          null, // placeholder for purchaseId
          product.id,
          line.quantity,
          line.unitCost,
          totalLine
        ]);

        inventoryTransactionsData.push([
          crypto.randomUUID(),
          'IN',
          line.quantity,
          `Compra Fac. ${dto.purchaseNumber}`,
          product.id,
          warehouseId
        ]);
      }

      const total = subtotal + ivaAmount;

      // 2. Fetch Accounts
      const [accounts] = await conn.query<RowDataPacket[]>(
        "SELECT id, code FROM accounts WHERE code IN ('1.1.5.01', '1.1.4.01', '2.1.1.01')"
      );

      const inventoryAccount = accounts.find(a => a.code === '1.1.5.01');
      const ivaAccount = accounts.find(a => a.code === '1.1.4.01');
      const suppliersAccount = accounts.find(a => a.code === '2.1.1.01');

      if (!inventoryAccount || !ivaAccount || !suppliersAccount) {
        throw new BadRequestException('Faltan cuentas contables base (Inventario, IVA compras, Proveedores).');
      }

      // 3. Create Journal Entry
      const journalEntryId = crypto.randomUUID();
      await conn.query(
        'INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)',
        [journalEntryId, new Date(), `Compra según Fac. ${dto.purchaseNumber}`, dto.purchaseNumber, null]
      );

      const journalLines = [
        [crypto.randomUUID(), journalEntryId, inventoryAccount.id, subtotal, 0, 'Ingreso de mercadería'],
        ...(ivaAmount > 0 ? [[crypto.randomUUID(), journalEntryId, ivaAccount.id, ivaAmount, 0, 'IVA Compras']] : []),
        [crypto.randomUUID(), journalEntryId, suppliersAccount.id, 0, total, 'Cuentas por pagar']
      ];

      await conn.query(
        'INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?',
        [journalLines]
      );

      // 4. Create Purchase
      const purchaseId = crypto.randomUUID();
      await conn.query(
        'INSERT INTO purchases (id, purchaseNumber, subtotal, ivaAmount, total, contactId) VALUES (?, ?, ?, ?, ?, ?)',
        [purchaseId, dto.purchaseNumber, subtotal, ivaAmount, total, dto.contactId]
      );

      // Vincular el asientro contable a la compra
      await conn.query('UPDATE journal_entries SET purchaseId = ? WHERE id = ?', [purchaseId, journalEntryId]);

      // 5. Create Purchase Lines
      const finalLines = linesData.map(l => { l[1] = purchaseId; return l; });
      await conn.query(
        'INSERT INTO purchase_lines (id, purchaseId, productId, quantity, unitCost, total) VALUES ?',
        [finalLines]
      );

      // 6. Kardex
      await conn.query(
        'INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES ?',
        [inventoryTransactionsData]
      );

      await conn.commit();
      return { id: purchaseId, purchaseNumber: dto.purchaseNumber, total };
      
    } catch (error) {
      await conn.rollback();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al generar compra: ' + error.message);
    } finally {
      conn.release();
    }
  }

  async findAll() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT p.*, c.name as contactName 
       FROM purchases p 
       JOIN contacts c ON p.contactId = c.id 
       ORDER BY p.date DESC`
    );
    return rows.map(r => ({
      ...r,
      contact: { name: r.contactName }
    }));
  }
}
