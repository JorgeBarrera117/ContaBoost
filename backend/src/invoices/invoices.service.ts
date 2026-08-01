import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(dto: CreateInvoiceDto) {
    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('La factura debe tener al menos un producto');
    }

    const conn = await this.pool.getConnection();

    try {
      await conn.beginTransaction();

      // 0. Validar Bodega
      const [warehouses] = await conn.query<RowDataPacket[]>('SELECT id FROM warehouses WHERE code = ?', ['BOD-01']);
      if (warehouses.length === 0) throw new InternalServerErrorException('Bodega Principal no encontrada.');
      const warehouseId = warehouses[0].id;

      // 1. Obtener y bloquear Punto de Emisión (Secuencial SRI)
      const [emissionPoints] = await conn.query<RowDataPacket[]>(
        `SELECT ep.id, ep.currentSequence AS "currentSequence" 
         FROM emission_points ep 
         JOIN establishments e ON ep.establishmentId = e.id 
         WHERE ep.code = ? AND e.code = ? FOR UPDATE`,
        [dto.emissionPointCode, dto.establishmentCode]
      );

      if (emissionPoints.length === 0) throw new BadRequestException('Punto de emisión no encontrado');
      
      const emissionPoint = emissionPoints[0];
      const sequence = emissionPoint.currentSequence;
      const formattedSequence = sequence.toString().padStart(9, '0');
      const invoiceNumber = `${dto.establishmentCode}-${dto.emissionPointCode}-${formattedSequence}`;

      await conn.query(
        'UPDATE emission_points SET currentSequence = currentSequence + 1 WHERE id = ?',
        [emissionPoint.id]
      );

      // 2. Procesar Productos y calcular totales
      let subtotal = 0;
      let ivaAmount = 0;
      let totalCost = 0;
      const invoiceLinesData = [];
      const inventoryTransactionsData = [];

      for (const line of dto.lines) {
        const [products] = await conn.query<RowDataPacket[]>(
          'SELECT id, name, cost, hasIva AS "hasIva", stock FROM products WHERE id = ? FOR UPDATE',
          [line.productId]
        );
        if (products.length === 0) throw new BadRequestException(`Producto ${line.productId} no encontrado`);
        
        const product = products[0];

        if (product.stock < line.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}`);
        }

        const lineTotal = Number(line.unitPrice) * line.quantity;
        subtotal += lineTotal;
        if (product.hasIva) {
          ivaAmount += lineTotal * 0.15; // 15% IVA Ecuador
        }
        
        totalCost += Number(product.cost) * line.quantity;

        // Restar stock
        await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [line.quantity, product.id]);

        invoiceLinesData.push([
          crypto.randomUUID(),
          null, // placeholder for invoiceId
          product.id,
          line.quantity,
          line.unitPrice,
          lineTotal
        ]);

        inventoryTransactionsData.push([
          crypto.randomUUID(),
          'OUT',
          line.quantity,
          `Venta Factura ${invoiceNumber}`,
          product.id,
          warehouseId
        ]);
      }
      const total = subtotal + ivaAmount;

      // 3. Cuentas Contables
      const [accounts] = await conn.query<RowDataPacket[]>(
        "SELECT id, code FROM accounts WHERE code IN ('1.1.3.01', '4.1.1', '2.1.3.01', '5.1.1', '1.1.5')"
      );

      const arAccount = accounts.find(a => a.code === '1.1.3.01'); // CxC
      const salesAccount = accounts.find(a => a.code === '4.1.1'); // Ventas
      const ivaAccount = accounts.find(a => a.code === '2.1.3.01'); // IVA
      const costAccount = accounts.find(a => a.code === '5.1.1'); // Costo de Ventas
      const invAccount = accounts.find(a => a.code === '1.1.5'); // Inventarios

      if (!arAccount || !salesAccount || !ivaAccount || !costAccount || !invAccount) {
        throw new InternalServerErrorException('Faltan cuentas contables maestras.');
      }

      // 4. Crear Asiento Contable
      const journalEntryId = crypto.randomUUID();
      await conn.query(
        'INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)',
        [journalEntryId, new Date(), `Venta Factura ${invoiceNumber}`, invoiceNumber, dto.userId || null]
      );

      const journalLines = [
        [crypto.randomUUID(), journalEntryId, arAccount.id, total, 0, null],
        [crypto.randomUUID(), journalEntryId, salesAccount.id, 0, subtotal, null],
        ...(ivaAmount > 0 ? [[crypto.randomUUID(), journalEntryId, ivaAccount.id, 0, ivaAmount, null]] : []),
        [crypto.randomUUID(), journalEntryId, costAccount.id, totalCost, 0, null],
        [crypto.randomUUID(), journalEntryId, invAccount.id, 0, totalCost, null]
      ];

      if (journalLines.length > 0) {
        await conn.query(
          'INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?',
          [journalLines]
        );
      }

      // 5. Guardar Factura
      const invoiceId = crypto.randomUUID();
      const pMethod = dto.paymentMethod || 'CASH';
      await conn.query(
        'INSERT INTO invoices (id, invoiceNumber, subtotal, ivaAmount, total, paymentMethod, contactId, emissionPointId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [invoiceId, invoiceNumber, subtotal, ivaAmount, total, pMethod, dto.contactId, emissionPoint.id]
      );

      // Vincular el asientro contable a la factura
      await conn.query('UPDATE journal_entries SET invoiceId = ? WHERE id = ?', [invoiceId, journalEntryId]);

      // Guardar lineas de factura
      const finalInvoiceLines = invoiceLinesData.map(l => { l[1] = invoiceId; return l; });
      await conn.query(
        'INSERT INTO invoice_lines (id, invoiceId, productId, quantity, unitPrice, total) VALUES ?',
        [finalInvoiceLines]
      );

      // Guardar transacciones de Kardex
      await conn.query(
        'INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES ?',
        [inventoryTransactionsData]
      );

      await conn.commit();
      return { id: invoiceId, invoiceNumber, total };

    } catch (error) {
      await conn.rollback();
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al generar factura: ' + error.message);
    } finally {
      conn.release();
    }
  }

  async findAll() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT i.id, i.invoiceNumber AS "invoiceNumber", i.date, i.subtotal, i.ivaAmount AS "ivaAmount", i.total, i.paymentMethod AS "paymentMethod", i.contactId AS "contactId", i.emissionPointId AS "emissionPointId", i.createdAt AS "createdAt", i.updatedAt AS "updatedAt", c.name as "contactName", ep.code as "emissionPointCode" 
       FROM invoices i 
       JOIN contacts c ON i.contactId = c.id 
       JOIN emission_points ep ON i.emissionPointId = ep.id
       ORDER BY i.invoiceNumber DESC`
    );
    // Mapear para simular el include de Prisma
    return rows.map(r => ({
      ...r,
      contact: { name: r.contactName },
      emissionPoint: { code: r.emissionPointCode }
    }));
  }

  async seedBilling() {
    // Para simplificar, este código ahora asume que el usuario corre el archivo seed_mock_data.sql.
    // Lo dejamos como mock para que no rompa rutas existentes en el botón "Inicializar".
    return { message: 'Use seed_mock_data.sql para inicializar datos (ya no se hace desde aquí)' };
  }
}
