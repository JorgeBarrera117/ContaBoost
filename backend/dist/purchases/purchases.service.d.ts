import type { Pool } from 'mysql2/promise';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesService {
    private pool;
    constructor(pool: Pool);
    create(dto: CreatePurchaseDto): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        purchaseNumber: string;
        total: number;
    }>;
    findAll(): Promise<{
        contact: {
            name: any;
        };
        constructor: {
            name: "RowDataPacket";
        };
    }[]>;
}
