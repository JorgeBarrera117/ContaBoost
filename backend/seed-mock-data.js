const crypto = require('crypto');
const { PostgresPoolWrapper } = require('./dist/database/database.wrapper');

async function run() {
  const wrapper = new PostgresPoolWrapper('postgresql://neondb_owner:npg_lCmeJM5jPs7u@ep-late-wind-ayrskl71-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  const conn = await wrapper.getConnection();
  
  try {
    await conn.beginTransaction();

    console.log('Seeding warehouses...');
    const warehouseId = crypto.randomUUID();
    await conn.query('INSERT INTO warehouses (id, code, name, address) VALUES (?, ?, ?, ?) ON CONFLICT (code) DO NOTHING', 
      [warehouseId, 'MATRIZ', 'Bodega Matriz', 'Av. Principal 123']);

    console.log('Seeding contacts...');
    const contactId = crypto.randomUUID();
    await conn.query('INSERT INTO contacts (id, identification, name, address, phone, email) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (identification) DO NOTHING',
      [contactId, '0999999999', 'Consumidor Final', 'Sin dirección', '0999999999', 'consumidor@ejemplo.com']);

    const providerId = crypto.randomUUID();
    await conn.query('INSERT INTO contacts (id, identification, name, address, phone, email) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (identification) DO NOTHING',
      [providerId, '1790000000001', 'Proveedor Principal S.A.', 'Quito, Ecuador', '022000000', 'ventas@proveedor.com']);

    console.log('Seeding products...');
    const productId1 = crypto.randomUUID();
    await conn.query('INSERT INTO products (id, code, name, description, cost, price, hasIva, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (code) DO NOTHING',
      [productId1, 'P001', 'Laptops Dell XPS 13', 'Laptop de alta gama', 900.00, 1200.00, true, 10]);
    
    const productId2 = crypto.randomUUID();
    await conn.query('INSERT INTO products (id, code, name, description, cost, price, hasIva, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (code) DO NOTHING',
      [productId2, 'P002', 'Mouse Inalámbrico Logitech', 'Mouse ergonómico', 15.00, 25.00, true, 50]);

    console.log('Seeding establishments and emission points...');
    const estId = crypto.randomUUID();
    await conn.query('INSERT INTO establishments (id, code, name) VALUES (?, ?, ?)', [estId, '001', 'Matriz']);
    
    const emId = crypto.randomUUID();
    await conn.query('INSERT INTO emission_points (id, code, establishmentId) VALUES (?, ?, ?)', [emId, '001', estId]);

    console.log('Seeding purchases...');
    const purchaseId = crypto.randomUUID();
    await conn.query('INSERT INTO purchases (id, date, purchaseNumber, contactId, subtotal, ivaAmount, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [purchaseId, new Date(), '001-001-000000001', providerId, 915.00, 109.80, 1024.80]);
    
    const purchaseLine1 = crypto.randomUUID();
    await conn.query('INSERT INTO purchase_lines (id, purchaseId, productId, quantity, unitCost, total) VALUES (?, ?, ?, ?, ?, ?)',
      [purchaseLine1, purchaseId, productId1, 10, 900.00, 9000.00]);
    
    const purchaseLine2 = crypto.randomUUID();
    await conn.query('INSERT INTO purchase_lines (id, purchaseId, productId, quantity, unitCost, total) VALUES (?, ?, ?, ?, ?, ?)',
      [purchaseLine2, purchaseId, productId2, 50, 15.00, 750.00]);

    // Inventory transactions for purchase
    await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'IN', 10, 'Compra ' + purchaseId, productId1, warehouseId]);
    await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'IN', 50, 'Compra ' + purchaseId, productId2, warehouseId]);

    console.log('Seeding invoices (ventas)...');
    const invoiceId = crypto.randomUUID();

    await conn.query('INSERT INTO invoices (id, date, invoiceNumber, contactId, subtotal, ivaAmount, total, emissionPointId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [invoiceId, new Date(), '001-001-000000001', contactId, 1225.00, 147.00, 1372.00, emId]);

    await conn.query('INSERT INTO invoice_lines (id, invoiceId, productId, quantity, unitPrice, total) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), invoiceId, productId1, 1, 1200.00, 1200.00]);
    await conn.query('INSERT INTO invoice_lines (id, invoiceId, productId, quantity, unitPrice, total) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), invoiceId, productId2, 1, 25.00, 25.00]);

    // Update stock to simulate sales
    await conn.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [productId1]);
    await conn.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [productId2]);

    await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'OUT', 1, 'Venta ' + invoiceId, productId1, warehouseId]);
    await conn.query('INSERT INTO inventory_transactions (id, type, quantity, reference, productId, warehouseId) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'OUT', 1, 'Venta ' + invoiceId, productId2, warehouseId]);

    await conn.commit();
    console.log('Seed completed successfully!');
  } catch (err) {
    await conn.rollback();
    console.error('Seed error:', err);
  } finally {
    conn.release();
  }
}

run();
