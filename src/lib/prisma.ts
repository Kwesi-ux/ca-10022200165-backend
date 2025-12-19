import { PrismaClient } from '@prisma/client';

// Simple singleton wrapper for Prisma Client to avoid multiple instances in dev/hot-reload
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

export const prisma = global.prismaClient ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}
