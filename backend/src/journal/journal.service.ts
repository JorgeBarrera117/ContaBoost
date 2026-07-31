import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import * as crypto from 'crypto';

@Injectable()
export class JournalService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(createDto: CreateJournalEntryDto) {
    if (!createDto.lines || createDto.lines.length === 0) {
      throw new BadRequestException('El asiento contable debe tener al menos una línea.');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    createDto.lines.forEach(line => {
      totalDebit += line.debit;
      totalCredit += line.credit;
    });

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    if (totalDebit !== totalCredit) {
      throw new BadRequestException(`El asiento no cuadra. Total Debe: ${totalDebit}, Total Haber: ${totalCredit}`);
    }

    const conn = await this.pool.getConnection();

    try {
      await conn.beginTransaction();

      const journalEntryId = crypto.randomUUID();
      await conn.query(
        'INSERT INTO journal_entries (id, date, description, reference, userId) VALUES (?, ?, ?, ?, ?)',
        [journalEntryId, new Date(createDto.date), createDto.description, createDto.reference || null, createDto.userId || null]
      );

      const linesData = createDto.lines.map(line => [
        crypto.randomUUID(),
        journalEntryId,
        line.accountId,
        line.debit,
        line.credit,
        line.description || null
      ]);

      await conn.query(
        'INSERT INTO journal_lines (id, journalEntryId, accountId, debit, credit, description) VALUES ?',
        [linesData]
      );

      await conn.commit();
      return { id: journalEntryId, description: createDto.description };
    } catch (error) {
      await conn.rollback();
      throw new InternalServerErrorException('Error al generar asiento contable: ' + error.message);
    } finally {
      conn.release();
    }
  }

  async findAll() {
    // Para replicar la respuesta anidada de Prisma, necesitamos armar el objeto manualmente
    const [entries] = await this.pool.query<RowDataPacket[]>(
      `SELECT je.*, u.nombre as userName 
       FROM journal_entries je
       LEFT JOIN usuarios u ON je.userId = u.id
       ORDER BY je.date DESC`
    );

    const [lines] = await this.pool.query<RowDataPacket[]>(
      `SELECT jl.*, a.name as accountName, a.code as accountCode
       FROM journal_lines jl
       JOIN accounts a ON jl.accountId = a.id`
    );

    return entries.map(entry => {
      return {
        ...entry,
        user: { name: entry.userName },
        lines: lines
          .filter(line => line.journalEntryId === entry.id)
          .map(line => ({
            ...line,
            account: { name: line.accountName, code: line.accountCode }
          }))
      };
    });
  }
}
