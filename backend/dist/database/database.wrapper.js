"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPoolWrapper = void 0;
const pg_1 = require("pg");
class PostgresPoolWrapper {
    pool;
    constructor(connectionString) {
        this.pool = new pg_1.Pool({ connectionString });
    }
    prepareQuery(sql, params = []) {
        let text = sql;
        let values = params;
        if (params.length === 1 && Array.isArray(params[0]) && params[0].length > 0 && Array.isArray(params[0][0])) {
            const rows = params[0];
            let index = 1;
            const placeholders = rows.map((row) => {
                const rowPlaceholders = row.map(() => `$${index++}`).join(', ');
                return `(${rowPlaceholders})`;
            }).join(', ');
            text = sql.replace(/\?/g, placeholders);
            values = rows.flat();
        }
        else {
            let index = 1;
            text = sql.replace(/\?/g, () => `$${index++}`);
        }
        if (text.trim().toUpperCase().startsWith('INSERT ')) {
            text += ' RETURNING *';
        }
        return { text, values };
    }
    async query(sql, params = []) {
        const { text, values } = this.prepareQuery(sql, params);
        const result = await this.pool.query(text, values);
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
                const { text, values } = this.prepareQuery(sql, params);
                const result = await client.query(text, values);
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