import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(createAccountDto: CreateAccountDto): Promise<{
        code: string;
        name: string;
        type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    findAll(): Promise<import("mysql2").RowDataPacket[]>;
    seedEcuadorAccounts(): Promise<{
        inserted: number;
        message: string;
    }>;
}
