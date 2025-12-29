import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create the 3 broker accounts
  const futu = await prisma.account.upsert({
    where: { name: 'Futu' },
    update: {},
    create: { name: 'Futu', currency: 'HKD' },
  })

  const webull = await prisma.account.upsert({
    where: { name: 'WeBull' },
    update: {},
    create: { name: 'WeBull', currency: 'USD' },
  })

  const tiger = await prisma.account.upsert({
    where: { name: 'Tiger' },
    update: {},
    create: { name: 'Tiger', currency: 'USD' },
  })

  console.log('Created accounts:', { futu, webull, tiger })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
