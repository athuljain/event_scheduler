const express = require("express");

const router = express.Router();

const {
  loginAdmin,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// Admin login
router.post("/login", loginAdmin);

// Get current admin
router.get("/me", protect, getMe);

module.exports = router;