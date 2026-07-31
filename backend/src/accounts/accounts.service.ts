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
    let inserted = 0;
    
    // Inserción individual para compatibilidad con PostgreSQL y el wrapper
    for (const acc of ecuadorChartOfAccounts) {
      const id = crypto.randomUUID();
      try {
        const sql = `
          INSERT INTO accounts (id, code, name, type) 
          VALUES (?, ?, ?, ?) 
          ON CONFLICT (code) DO NOTHING
        `;
        const [result]: any = await this.pool.query(sql, [id, acc.code, acc.name, acc.type]);
        
        // Verifica si insertId fue retornado o si filas fueron afectadas
        if (result && result.insertId) {
          inserted++;
        }
      } catch (err) {
        console.error('Error seeding account:', acc.code, err);
      }
    }

    return { inserted, message: 'Plan de cuentas cargado o actualizado.' };
  }
}
