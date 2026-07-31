export declare class PostgresPoolWrapper {
    private pool;
    constructor(connectionString: string);
    private prepareQuery;
    query<T = any>(sql: string, params?: any[]): Promise<[T]>;
    getConnection(): Promise<{
        query: <T = any>(sql: string, params?: any[]) => Promise<[T]>;
        beginTransaction: () => Promise<import("pg").QueryResult<any>>;
        commit: () => Promise<import("pg").QueryResult<any>>;
        rollback: () => Promise<import("pg").QueryResult<any>>;
        release: () => void;
    }>;
}
