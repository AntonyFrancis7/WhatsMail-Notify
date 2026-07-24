const gmailService = require("./gmailService");
const rulesEngine = require("./rulesEngine");

/**
 * Retrieves a single Gmail message by ID and analyzes it.
 * @param {string} userId
 * @param {string} messageId
 * @returns {Promise<object>} Detailed analysis payload
 */
const processAndAnalyzeEmail = async (userId, messageId) => {
  if (!userId || !messageId) {
    throw new Error("UserId and MessageId parameters are required.");
  }

  console.log(`[PROCESSOR_SERVICE] Running sync analysis for message ID: ${messageId} (User: ${userId})`);

  // 1. Fetch message details from Gmail service
  const email = await gmailService.getMessageDetail(userId, messageId);
  if (!email) {
    throw new Error(`Message details could not be loaded for ID: ${messageId}`);
  }

  // 2. Evaluate email contents using the rules engine pipeline
  const analysis = await rulesEngine.evaluateEmail(userId, email);

  return {
    messageId: email.id,
    subject: email.subject,
    sender: email.sender,
    date: email.date,
    analysis
  };
};

module.exports = {
  processAndAnalyzeEmail
};
