const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      console.log("[AUTH_ERROR] Verification failed: No token provided in cookies");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided"
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch associated User from Database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      console.log(`[AUTH_ERROR] Verification failed: User not found for ID ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User database record missing"
      });
    }

    // Attach to request
    req.user = user;
    next();
  } catch (error) {
    console.error(`[AUTH_ERROR] Verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token"
    });
  }
};

module.exports = authMiddleware;
