import { Pool, PoolClient } from 'pg';

export class PostgresPoolWrapper {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  // Convert MySQL `?` to Postgres `$1, $2`
  private formatQuery(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  // Mimic mysql2 `pool.query` returning [rows, fields]
  async query<T = any>(sql: string, params: any[] = []): Promise<[T]> {
    const pgSql = this.formatQuery(sql);
    let finalSql = pgSql;
    if (sql.trim().toUpperCase().startsWith('INSERT ')) {
      finalSql += ' RETURNING *';
    }
    const result = await this.pool.query(finalSql, params);
    if (sql.trim().toUpperCase().startsWith('INSERT ')) {
       const insertId = result.rows[0]?.id || null;
       return [{ insertId } as any];
    }
    return [result.rows as any];
  }

  async getConnection() {
    const client = await this.pool.connect();
    return {
      query: async <T = any>(sql: string, params: any[] = []): Promise<[T]> => {
        let index = 1;
        let pgSql = sql.replace(/\?/g, () => `$${index++}`);
        if (sql.trim().toUpperCase().startsWith('INSERT ')) {
          pgSql += ' RETURNING *';
        }
        const result = await client.query(pgSql, params);
        if (sql.trim().toUpperCase().startsWith('INSERT ')) {
           const insertId = result.rows[0]?.id || null;
           return [{ insertId } as any];
        }
        return [result.rows as any];
      },
      beginTransaction: async () => client.query('BEGIN'),
      commit: async () => client.query('COMMIT'),
      rollback: async () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  }
}
