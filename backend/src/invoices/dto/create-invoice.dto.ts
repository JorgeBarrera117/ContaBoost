export class CreateInvoiceDto {
  contactId: string;
  establishmentCode: string; // ej. '001'
  emissionPointCode: string; // ej. '001'
  userId?: string;
  paymentMethod?: string; // 'CASH', 'CARD', 'TRANSFER'
  lines: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
