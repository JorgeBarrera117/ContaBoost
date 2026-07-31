const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://root:rootpassword@localhost:5432/contaboost?schema=public'
  });

  try {
    await client.connect();
    const res = await client.query('UPDATE "EmissionPoint" SET "currentSequence" = 100;');
    console.log('Update successful. Rows affected:', res.rowCount);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

run();
