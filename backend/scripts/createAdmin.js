require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Admin credentials are missing");
    }

    const existingAdmin = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (email, password)
       VALUES ($1, $2)`,
      [email, hashedPassword]
    );

    console.log("Admin created successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
};

createAdmin();