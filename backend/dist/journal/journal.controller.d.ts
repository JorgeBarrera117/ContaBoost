import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    create(createJournalDto: CreateJournalEntryDto): Promise<{
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
