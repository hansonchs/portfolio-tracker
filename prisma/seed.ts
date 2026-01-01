import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create the 3 broker accounts
  const futu = await prisma.account.create({
    data: { name: 'Futu', currency: 'HKD', userId: 'seed_user' },
  })

  const webull = await prisma.account.create({
    data: { name: 'WeBull', currency: 'USD', userId: 'seed_user' },
  })

  const tiger = await prisma.account.create({
    data: { name: 'Tiger', currency: 'USD', userId: 'seed_user' },
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
