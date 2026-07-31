"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPoolWrapper = void 0;
const pg_1 = require("pg");
class PostgresPoolWrapper {
    pool;
    constructor(connectionString) {
        this.pool = new pg_1.Pool({ connectionString });
    }
    formatQuery(sql) {
        let index = 1;
        return sql.replace(/\?/g, () => `$${index++}`);
    }
    async query(sql, params = []) {
        const pgSql = this.formatQuery(sql);
        let finalSql = pgSql;
        if (sql.trim().toUpperCase().startsWith('INSERT ')) {
            finalSql += ' RETURNING *';
        }
        const result = await this.pool.query(finalSql, params);
        if (sql.trim().toUpperCase().startsWith('INSERT ')) {
            const insertId = result.rows[0]?.id || null;
            return [{ insertId }];
        }
        return [result.rows];
    }
    async getConnection() {
        const client = await this.pool.connect();
        return {
            query: async (sql, params = []) => {
                let index = 1;
                let pgSql = sql.replace(/\?/g, () => `$${index++}`);
                if (sql.trim().toUpperCase().startsWith('INSERT ')) {
                    pgSql += ' RETURNING *';
                }
                const result = await client.query(pgSql, params);
                if (sql.trim().toUpperCase().startsWith('INSERT ')) {
                    const insertId = result.rows[0]?.id || null;
                    return [{ insertId }];
                }
                return [result.rows];
            },
            beginTransaction: async () => client.query('BEGIN'),
            commit: async () => client.query('COMMIT'),
            rollback: async () => client.query('ROLLBACK'),
            release: () => client.release(),
        };
    }
}
exports.PostgresPoolWrapper = PostgresPoolWrapper;
//# sourceMappingURL=database.wrapper.js.map