import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@creatorpilot.ai' },
    update: {},
    create: {
      email: 'admin@creatorpilot.ai',
      passwordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@creatorpilot.ai' },
    update: {},
    create: {
      email: 'demo@creatorpilot.ai',
      passwordHash: await bcrypt.hash('demo123', 12),
      name: 'Demo Creator',
      role: UserRole.USER,
    },
  });

  const channel = await prisma.channel.upsert({
    where: { id: 'seed-channel-1' },
    update: {},
    create: {
      id: 'seed-channel-1',
      userId: demoUser.id,
      name: 'MindShift Shorts',
      niche: 'Psychology & Self-Improvement',
      targetAudience: 'United States',
      tone: 'engaging',
      postingFrequency: 'daily',
      wizardStep: 5,
      wizardComplete: true,
      platforms: ['YOUTUBE', 'TIKTOK'],
    },
  });

  console.log({ admin: admin.email, demo: demoUser.email, channel: channel.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
