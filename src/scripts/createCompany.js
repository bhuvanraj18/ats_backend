const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Create company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
    },
  });

  console.log('Company created:', company);

  // 2. Link recruiter to company
  await prisma.user.update({
    where: { email: 'recruiter@test.com' }, // make sure this email exists
    data: { companyId: company.id },
  });

  console.log('Recruiter linked to company');
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
