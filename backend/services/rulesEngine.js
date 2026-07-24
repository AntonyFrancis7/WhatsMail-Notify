const categoryService = require("./categoryService");
const priorityService = require("./priorityService");
const preferenceService = require("./preferenceService");
const notificationDecisionService = require("./notificationDecisionService");

/**
 * Evaluates an email message against the user preferences and classifications.
 * @param {string} userId
 * @param {object} email Formatted email details (sender, subject, snippet, body, labels, attachments, unread)
 * @returns {Promise<object>} Analysis decision payload
 */
const evaluateEmail = async (userId, email) => {
  if (!userId) {
    throw new Error("UserId parameter is required for evaluation.");
  }
  if (!email) {
    throw new Error("Email payload details are required for evaluation.");
  }

  console.log(`[RULES_ENGINE] Evaluating email ID: ${email.id || "mock"} for user: ${userId}`);

  // 1. Resolve Category Classification
  const category = categoryService.classifyEmailCategory(email);
  console.log(`[RULES_ENGINE] Categorized email as: ${category}`);

  // 2. Retrieve User Preferences and Lists
  const [preferences, customKeywords, trustedSenders, blockedSenders] = await Promise.all([
    preferenceService.getPreferences(userId),
    preferenceService.getCustomKeywords(userId),
    preferenceService.getTrustedSenders(userId),
    preferenceService.getBlockedSenders(userId)
  ]);

  // Extract trust domains and emails for scoring helper
  const trustedEmails = trustedSenders.filter(s => s.enabled && s.email).map(s => s.email.toLowerCase().trim());
  const trustedDomains = trustedSenders.filter(s => s.enabled && s.domain).map(s => s.domain.toLowerCase().trim());

  // 3. Resolve Priority Score & Level
  const { score, priority } = priorityService.calculatePriority(email, category, trustedEmails, trustedDomains);
  console.log(`[RULES_ENGINE] Priority score calculated: ${score} (${priority})`);

  // 4. Resolve Notification Decision checks
  const userConfig = {
    preferences,
    customKeywords,
    trustedSenders,
    blockedSenders
  };

  const decision = notificationDecisionService.makeNotificationDecision(email, category, priority, score, userConfig);
  console.log(`[RULES_ENGINE] Notification Decision: shouldNotify=${decision.shouldNotify} (Reason: "${decision.reason}")`);

  return decision;
};

module.exports = {
  evaluateEmail
};
