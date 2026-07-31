import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private pool;
    constructor(pool: Pool);
    create(dto: CreateProductDto): Promise<{
        code: string;
        name: string;
        description?: string;
        cost: number;
        price: number;
        hasIva: boolean;
        stock?: number;
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    update(id: string, dto: CreateProductDto): Promise<{
        code: string;
        name: string;
        description?: string;
        cost: number;
        price: number;
        hasIva: boolean;
        stock?: number;
        id: string;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    findAll(): Promise<RowDataPacket[]>;
    getNextSku(): Promise<{
        sku: string;
    }>;
    seedWarehouse(): Promise<RowDataPacket | {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: string;
        name: string;
    }>;
}
