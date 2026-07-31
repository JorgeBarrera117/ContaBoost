export declare class CreateInvoiceDto {
    contactId: string;
    establishmentCode: string;
    emissionPointCode: string;
    userId?: string;
    paymentMethod?: string;
    lines: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
}
