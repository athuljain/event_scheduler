
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { protect };
