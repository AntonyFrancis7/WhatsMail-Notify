const express = require("express");
const processorController = require("../controllers/processorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to verify JWT cookies on all routes
router.use(authMiddleware);

// GET /api/processor/analyze/:messageId -> Analyzes a real Gmail message
router.get("/analyze/:messageId", processorController.analyzeRealEmail);

// POST /api/processor/analyze -> Dry-run analyze a mock email payload
router.post("/analyze", processorController.analyzeMockEmail);

// GET /api/processor/test -> Runs automated intelligence rules tests
router.get("/test", processorController.runQATests);

module.exports = router;
