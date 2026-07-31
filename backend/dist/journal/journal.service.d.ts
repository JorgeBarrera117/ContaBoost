import type { Pool } from 'mysql2/promise';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
export declare class JournalService {
    private pool;
    constructor(pool: Pool);
    create(createDto: CreateJournalEntryDto): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        description: string;
    }>;
    findAll(): Promise<{
        user: {
            name: any;
        };
        lines: {
            account: {
                name: any;
                code: any;
            };
            constructor: {
                name: "RowDataPacket";
            };
        }[];
        constructor: {
            name: "RowDataPacket";
        };
    }[]>;
}
