import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
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
