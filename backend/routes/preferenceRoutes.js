const express = require("express");
const preferenceController = require("../controllers/preferenceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware to protect all settings endpoints
router.use(authMiddleware);

// GET /api/preferences -> Retrieves settings and configuration lists
router.get("/", preferenceController.getPreferences);

// PUT /api/preferences -> Updates category toggles & priority bounds
router.put("/", preferenceController.updatePreferences);

// GET /api/preferences/default -> Gets default template configuration
router.get("/default", preferenceController.getDefaultPreferences);

// Custom keywords routes
router.post("/keywords", preferenceController.addCustomKeyword);
router.delete("/keywords/:id", preferenceController.deleteCustomKeyword);

// Trusted senders routes
router.post("/trusted", preferenceController.addTrustedSender);
router.delete("/trusted/:id", preferenceController.deleteTrustedSender);

// Blocked senders routes
router.post("/blocked", preferenceController.addBlockedSender);
router.delete("/blocked/:id", preferenceController.deleteBlockedSender);

module.exports = router;
