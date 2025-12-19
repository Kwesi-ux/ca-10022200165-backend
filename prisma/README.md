This folder contains the Prisma schema and instructions for generating the Prisma Client.

Quick steps:

1. Ensure your `DATABASE_URL` is set in the environment.
2. From the project root run:

   npm install
   npx prisma generate

3. The generated client will be placed at `src/generated/prisma` and the project exposes a singleton wrapper at `src/lib/prisma.ts` for safe imports.

Smoke test:

- `node -r ts-node/register src/scripts/prisma-smoke.ts` (or compile and run with `tsc` + `node`).
