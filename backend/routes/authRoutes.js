const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/auth/google
router.get("/google", authController.login);

// GET /api/auth/google/callback
router.get("/google/callback", authController.callback);

// GET /api/auth/profile
router.get("/profile", authMiddleware, authController.profile);

// POST /api/auth/logout
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
// 
