import type { Pool, RowDataPacket } from 'mysql2/promise';
import { CreateAccountDto } from './dto/create-account.dto';
export declare class AccountsService {
    private pool;
    constructor(pool: Pool);
    create(createAccountDto: CreateAccountDto): Promise<{
        code: string;
        name: string;
        type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    findAll(): Promise<RowDataPacket[]>;
    seedEcuadorAccounts(): Promise<{
        inserted: number;
        message: string;
    }>;
}
