const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const pool = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static image folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(400).json({
    message: err.message || "Something went wrong",
  });
});


// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Event Scheduler API is running",
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("PostgreSQL Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();