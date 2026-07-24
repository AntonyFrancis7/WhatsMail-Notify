const gmailService = require("../services/gmailService");

/**
 * GET /api/gmail/profile
 * Returns Gmail inbox account profile details.
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[GMAIL_CONTROLLER] Fetching Gmail profile for user ID: ${userId}`);
    
    const profile = await gmailService.getProfile(userId);
    
    console.log(`[GMAIL_CONTROLLER] Gmail Connected & Profile Retrieved successfully for user ID: ${userId}`);
    res.status(200).json({
      success: true,
      message: "Gmail profile retrieved successfully",
      data: profile
    });
  } catch (error) {
    console.error(`[GMAIL_CONTROLLER_ERROR] Failed to retrieve Gmail profile: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/gmail/messages
 * Returns the latest 25 emails with pagination and query-based search support.
 */
const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q = "", pageToken = null } = req.query;
    
    console.log(`[GMAIL_CONTROLLER] Fetching messages for user ID: ${userId} (Query: "${q}", PageToken: "${pageToken || "none"}")`);
    
    const result = await gmailService.getMessages(userId, { q, pageToken, maxResults: 25 });
    
    console.log(`[GMAIL_CONTROLLER] Messages Retrieved successfully for user ID: ${userId} (Count: ${result.messages.length})`);
    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: result.messages,
        nextPageToken: result.nextPageToken
      }
    });
  } catch (error) {
    console.error(`[GMAIL_CONTROLLER_ERROR] Failed to retrieve Gmail messages: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/gmail/message/:id
 * Returns the full body and attachments metadata of a single email message.
 */
const getMessageDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Message ID parameter is required"
      });
    }
    
    console.log(`[GMAIL_CONTROLLER] Fetching full details for message ID: ${id} (User ID: ${userId})`);
    
    const message = await gmailService.getMessageDetail(userId, id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    console.log(`[GMAIL_CONTROLLER] Message Opened successfully. Message ID: ${id} (User ID: ${userId})`);
    res.status(200).json({
      success: true,
      message: "Message details retrieved successfully",
      data: message
    });
  } catch (error) {
    console.error(`[GMAIL_CONTROLLER_ERROR] Failed to retrieve message details (ID: ${req.params.id}): ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/gmail/messages/:messageId/attachments/:attachmentId
 * Downloads an attachment file from a Gmail message.
 */
const getAttachment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId, attachmentId } = req.params;
    const filename = req.query.filename || "attachment";
    
    if (!messageId || !attachmentId) {
      return res.status(400).json({
        success: false,
        message: "Message ID and Attachment ID parameters are required"
      });
    }

    console.log(`[GMAIL_CONTROLLER] Fetching attachment ID: ${attachmentId} from message ID: ${messageId} for user ID: ${userId}`);
    
    const attachment = await gmailService.getAttachment(userId, messageId, attachmentId);
    
    if (!attachment || !attachment.data) {
      return res.status(404).json({
        success: false,
        message: "Attachment data not found"
      });
    }

    // Gmail API returns attachment data as a base64url encoded string
    const buffer = Buffer.from(attachment.data, "base64url");
    
    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", req.query.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error(`[GMAIL_CONTROLLER_ERROR] Failed to retrieve attachment: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getProfile,
  getMessages,
  getMessageDetail,
  getAttachment
};
