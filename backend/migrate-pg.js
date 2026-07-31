const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_lCmeJM5jPs7u@ep-late-wind-ayrskl71-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Connected to NeonDB PostgreSQL');

  const schemaPath = path.join(__dirname, 'sql', 'schema.pg.sql');
  const seedPath = path.join(__dirname, 'sql', 'seed_permisos.pg.sql');
  
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  try {
    console.log('Running Schema...');
    await client.query(schemaSql);
    
    console.log('Running Seed...');
    await client.query(seedSql);
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

run();
