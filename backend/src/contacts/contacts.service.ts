import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateContactDto } from './dto/create-contact.dto';
import * as crypto from 'crypto';

@Injectable()
export class ContactsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(dto: CreateContactDto) {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT id FROM contacts WHERE identification = ?',
      [dto.identification]
    );

    if (existing.length > 0) {
      throw new BadRequestException('La identificación ya está registrada');
    }

    const id = crypto.randomUUID();
    await this.pool.query(
      'INSERT INTO contacts (id, identification, name, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      [id, dto.identification, dto.name, dto.address, dto.phone, dto.email]
    );

    return { id, ...dto };
  }

  async update(id: string, dto: CreateContactDto) {
    const [existing] = await this.pool.query<RowDataPacket[]>(
      'SELECT identification FROM contacts WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      throw new BadRequestException('Contacto no encontrado');
    }

    if (dto.identification !== existing[0].identification) {
      const [idTaken] = await this.pool.query<RowDataPacket[]>(
        'SELECT id FROM contacts WHERE identification = ?',
        [dto.identification]
      );
      if (idTaken.length > 0) {
        throw new BadRequestException('La nueva identificación ya está registrada');
      }
    }

    await this.pool.query(
      'UPDATE contacts SET identification = ?, name = ?, address = ?, phone = ?, email = ? WHERE id = ?',
      [dto.identification, dto.name, dto.address, dto.phone, dto.email, id]
    );

    return { id, ...dto };
  }

  async remove(id: string) {
    try {
      await this.pool.query('DELETE FROM contacts WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      // Si el error es de foreign key (código 1451)
      throw new BadRequestException('No se puede eliminar el contacto porque tiene transacciones asociadas.');
    }
  }

  async findAll() {
    const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM contacts ORDER BY name ASC');
    return rows;
  }
}
