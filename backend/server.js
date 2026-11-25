const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const prisma = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Event Scheduler API is running");
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL Connected Successfully through Prisma");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();