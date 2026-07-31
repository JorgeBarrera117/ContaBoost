import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactsService {
    private pool;
    constructor(pool: Pool);
    create(dto: CreateContactDto): Promise<{
        identification: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    update(id: string, dto: CreateContactDto): Promise<{
        identification: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        id: string;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    findAll(): Promise<RowDataPacket[]>;
}
