require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Admin credentials are missing");
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();