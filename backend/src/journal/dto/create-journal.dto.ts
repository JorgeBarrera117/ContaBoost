export class CreateJournalLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export class CreateJournalEntryDto {
  date: string;
  description: string;
  reference?: string;
  userId?: string;
  lines: CreateJournalLineDto[];
}
