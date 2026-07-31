const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial billing dependencies...');

  // 1. Create Establishment 001
  const establishment = await prisma.establishment.create({
    data: { code: '001', name: 'Matriz Principal' }
  });

  // 2. Create Emission Point 001
  await prisma.emissionPoint.create({
    data: { code: '001', currentSequence: 1, establishmentId: establishment.id }
  });

  // 3. Create Default Customer
  await prisma.contact.create({
    data: { identification: '9999999999999', name: 'Consumidor Final' }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
