import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    findAll(): Promise<import("mysql2").RowDataPacket[]>;
    getNextSku(): Promise<{
        sku: string;
    }>;
    seedWarehouse(): Promise<import("mysql2").RowDataPacket | {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: string;
        name: string;
    }>;
}
