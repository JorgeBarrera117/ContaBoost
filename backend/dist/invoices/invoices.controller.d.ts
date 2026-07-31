import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
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
