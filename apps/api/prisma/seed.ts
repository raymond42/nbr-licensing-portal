import { ApplicationStatus, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

const DEFAULT_PASSWORD = 'password1234';

async function main() {
  const prisma = new PrismaClient();
  const passwordPlain = process.env.SEED_DEFAULT_PASSWORD?.trim() || DEFAULT_PASSWORD;
  if (passwordPlain.length < 12) {
    throw new Error('SEED_DEFAULT_PASSWORD must be at least 12 characters when set.');
  }
  const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_COST);

  try {
    const applicant = await prisma.user.upsert({
      where: { email: 'applicant@nbr.rw' },
      update: { passwordHash, fullName: 'Demo Applicant', role: Role.APPLICANT, isActive: true },
      create: {
        email: 'applicant@nbr.rw',
        fullName: 'Demo Applicant',
        role: Role.APPLICANT,
        passwordHash,
      },
    });

    await prisma.user.upsert({
      where: { email: 'reviewer@nbr.rw' },
      update: { passwordHash, fullName: 'Demo Reviewer', role: Role.REVIEWER, isActive: true },
      create: {
        email: 'reviewer@nbr.rw',
        fullName: 'Demo Reviewer',
        role: Role.REVIEWER,
        passwordHash,
      },
    });

    await prisma.user.upsert({
      where: { email: 'approver@nbr.rw' },
      update: { passwordHash, fullName: 'Demo Approver', role: Role.APPROVER, isActive: true },
      create: {
        email: 'approver@nbr.rw',
        fullName: 'Demo Approver',
        role: Role.APPROVER,
        passwordHash,
      },
    });

    await prisma.user.upsert({
      where: { email: 'admin@nbr.rw' },
      update: { passwordHash, fullName: 'Demo Admin', role: Role.ADMIN, isActive: true },
      create: {
        email: 'admin@nbr.rw',
        fullName: 'Demo Admin',
        role: Role.ADMIN,
        passwordHash,
      },
    });

    const existingApps = await prisma.application.count({
      where: { applicantId: applicant.id },
    });
    if (existingApps === 0) {
      await prisma.application.create({
        data: {
          applicantId: applicant.id,
          institutionName: 'Kigali Community Microfinance',
          licenseCategory: 'Microfinance',
          status: ApplicationStatus.UNDER_REVIEW,
          version: 2,
          submittedAt: new Date(),
        },
      });
      await prisma.application.create({
        data: {
          applicantId: applicant.id,
          institutionName: 'Northern Province Credit Union',
          licenseCategory: 'Credit Union',
          status: ApplicationStatus.INFO_REQUESTED,
          version: 4,
          submittedAt: new Date(),
        },
      });
    }

    console.log('[seed] users: applicant@nbr.rw, reviewer@nbr.rw, approver@nbr.rw, admin@nbr.rw');
    console.log(
      `[seed] password (default): ${DEFAULT_PASSWORD} — override with SEED_DEFAULT_PASSWORD`,
    );
    console.log('[seed] applications: seeded when none existed for demo applicant');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
