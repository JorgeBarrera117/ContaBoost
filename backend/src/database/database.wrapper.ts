import { Pool, PoolClient } from 'pg';

export class PostgresPoolWrapper {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  // Convert MySQL `?` to Postgres `$1, $2` and handle bulk inserts `VALUES ?`
  private prepareQuery(sql: string, params: any[] = []): { text: string; values: any[] } {
    let text = sql;
    let values = params;

    if (params.length === 1 && Array.isArray(params[0]) && params[0].length > 0 && Array.isArray(params[0][0])) {
      const rows = params[0];
      let index = 1;
      const placeholders = rows.map((row: any[]) => {
        const rowPlaceholders = row.map(() => `$${index++}`).join(', ');
        return `(${rowPlaceholders})`;
      }).join(', ');
      
      text = sql.replace(/\?/g, placeholders);
      values = rows.flat();
    } else {
      let index = 1;
      text = sql.replace(/\?/g, () => `$${index++}`);
    }

    if (text.trim().toUpperCase().startsWith('INSERT ')) {
      text += ' RETURNING *';
    }

    return { text, values };
  }

  // Mimic mysql2 `pool.query` returning [rows, fields]
  async query<T = any>(sql: string, params: any[] = []): Promise<[T]> {
    const { text, values } = this.prepareQuery(sql, params);
    const result = await this.pool.query(text, values);
    
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
        const { text, values } = this.prepareQuery(sql, params);
        const result = await client.query(text, values);
        
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
