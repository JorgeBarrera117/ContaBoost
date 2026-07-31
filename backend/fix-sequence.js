const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const emissionPoint = await prisma.emissionPoint.findFirst({
      where: { code: '001' }
    });

    if (emissionPoint) {
      const invoices = await prisma.invoice.findMany({
        where: { emissionPointId: emissionPoint.id },
        orderBy: { date: 'desc' },
        take: 1
      });

      if (invoices.length > 0) {
        // e.g. "001-001-000000005"
        const lastInv = invoices[0].invoiceNumber;
        const seqStr = lastInv.split('-')[2];
        const lastSeq = parseInt(seqStr, 10);
        
        console.log(`Last invoice sequence: ${lastSeq}`);

        // Update emission point sequence to be greater than the last sequence
        if (emissionPoint.currentSequence <= lastSeq) {
          await prisma.emissionPoint.update({
            where: { id: emissionPoint.id },
            data: { currentSequence: lastSeq + 1 }
          });
          console.log(`Updated emission point sequence to ${lastSeq + 1}`);
        } else {
          console.log(`Emission point sequence is already higher: ${emissionPoint.currentSequence}`);
        }
      } else {
        console.log('No invoices found for this emission point.');
      }
    } else {
      console.log('Emission point 001 not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
