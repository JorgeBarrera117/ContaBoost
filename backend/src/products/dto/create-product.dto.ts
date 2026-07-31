export class CreateProductDto {
  code: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  hasIva: boolean;
  stock?: number;
}
