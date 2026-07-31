import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateAccountDto } from './dto/create-account.dto';
import { ecuadorChartOfAccounts } from './accounts.seed';
import * as crypto from 'crypto';

@Injectable()
export class AccountsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(createAccountDto: CreateAccountDto) {
    const id = crypto.randomUUID();
    await this.pool.query(
      'INSERT INTO accounts (id, code, name, type) VALUES (?, ?, ?, ?)',
      [id, createAccountDto.code, createAccountDto.name, createAccountDto.type]
    );
    return { id, ...createAccountDto };
  }

  async findAll() {
    const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM accounts ORDER BY code ASC');
    return rows;
  }

  async seedEcuadorAccounts() {
    // Generar IDs para cada cuenta y preparar el arreglo para inserción múltiple
    const values = ecuadorChartOfAccounts.map(acc => [
      crypto.randomUUID(), 
      acc.code, 
      acc.name, 
      acc.type
    ]);

    // IGNORE omitirá errores de duplicidad de código
    const [result]: any = await this.pool.query(
      'INSERT IGNORE INTO accounts (id, code, name, type) VALUES ?',
      [values]
    );

    return { inserted: result.affectedRows, message: 'Plan de cuentas cargado.' };
  }
}
