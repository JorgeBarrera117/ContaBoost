import type { Pool } from 'mysql2/promise';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesService {
    private pool;
    constructor(pool: Pool);
    create(dto: CreateInvoiceDto): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        invoiceNumber: string;
        total: number;
    }>;
    findAll(): Promise<{
        contact: {
            name: any;
        };
        emissionPoint: {
            code: any;
        };
        constructor: {
            name: "RowDataPacket";
        };
    }[]>;
    seedBilling(): Promise<{
        message: string;
    }>;
}
