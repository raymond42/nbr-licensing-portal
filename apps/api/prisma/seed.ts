import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required.');
  }
  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, fullName: 'Platform Administrator', role: Role.ADMIN, passwordHash },
    });
    console.log(`[seed] admin ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
