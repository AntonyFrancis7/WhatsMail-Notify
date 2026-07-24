const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["error", "warn"]
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("[POSTGRES] Connected successfully to database via Prisma client");
  } catch (error) {
    console.error(`❌ [POSTGRES] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
