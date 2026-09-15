import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@local.test";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Administrador",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12)
    }
  });

  console.log(`Admin listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
