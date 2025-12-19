import { prisma } from '../lib/prisma';

async function main() {
  // Run a small query that's safe even without data: count users
  const count = await prisma.user.count();
  console.log('User count:', count);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
