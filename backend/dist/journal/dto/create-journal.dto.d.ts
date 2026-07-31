export declare class CreateJournalLineDto {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
}
export declare class CreateJournalEntryDto {
    date: string;
    description: string;
    reference?: string;
    userId?: string;
    lines: CreateJournalLineDto[];
}
