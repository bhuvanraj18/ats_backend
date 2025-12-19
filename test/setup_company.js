const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const company = await prisma.company.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                name: 'Test Company',
                // other required fields? checked schema, just name is required (+ timestamps)
            },
        });
        console.log('Company 1 ensured:', company);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
