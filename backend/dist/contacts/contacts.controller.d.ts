import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
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
    findAll(): Promise<import("mysql2").RowDataPacket[]>;
}
