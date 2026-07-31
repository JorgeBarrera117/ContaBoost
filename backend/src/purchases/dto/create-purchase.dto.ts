export class CreatePurchaseDto {
  contactId: string;
  purchaseNumber: string;
  lines: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}
