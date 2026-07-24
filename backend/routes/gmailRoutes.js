const express = require("express");
const gmailController = require("../controllers/gmailController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply authMiddleware to all routes defined in this file to verify the JWT
router.use(authMiddleware);

// GET /api/gmail/profile -> Returns Gmail profile.
router.get("/profile", gmailController.getProfile);

// GET /api/gmail/messages -> Returns latest 25 emails with pagination and search parameters.
router.get("/messages", gmailController.getMessages);

// GET /api/gmail/message/:id -> Returns full email details including body and attachments.
router.get("/message/:id", gmailController.getMessageDetail);

// GET /api/gmail/messages/:messageId/attachments/:attachmentId -> Downloads an attachment file.
router.get("/messages/:messageId/attachments/:attachmentId", gmailController.getAttachment);

module.exports = router;
