const { PRIORITY_SCORES, PRIORITY_LEVELS } = require("../constants/priorityRules");
const { classifySender, SENDER_TYPES } = require("../utils/senderClassifier");
const { getMatchedKeywords } = require("../utils/keywordMatcher");

/**
 * Calculates priority score and returns level (LOW, MEDIUM, HIGH).
 * @param {object} email Formatted email details
 * @param {string} category Resolved email category
 * @param {Array<string>} userTrustedEmails Custom list of trusted emails from db
 * @param {Array<string>} userTrustedDomains Custom list of trusted domains from db
 * @returns {{score: number, priority: string}}
 */
const calculatePriority = (email, category, userTrustedEmails = [], userTrustedDomains = []) => {
  if (!email) {
    return { score: 0, priority: PRIORITY_LEVELS.LOW };
  }

  let score = 0;

  // 1. Evaluate Sender Classification
  const senderAnalysis = classifySender(email.sender || "", userTrustedEmails, userTrustedDomains);
  const senderType = senderAnalysis.senderType;

  if (senderType === SENDER_TYPES.BANK) {
    score += PRIORITY_SCORES.SENDER_TYPE.BANK;
  } else if (senderType === SENDER_TYPES.SECURITY) {
    score += PRIORITY_SCORES.SENDER_TYPE.SECURITY;
  } else if (senderType === SENDER_TYPES.TRUSTED) {
    score += PRIORITY_SCORES.SENDER_TYPE.TRUSTED;
  } else if (senderType === SENDER_TYPES.GOVERNMENT) {
    score += PRIORITY_SCORES.SENDER_TYPE.GOVERNMENT;
  } else if (senderType === SENDER_TYPES.WORK) {
    score += PRIORITY_SCORES.SENDER_TYPE.WORK;
  } else if (senderType === SENDER_TYPES.SHOPPING) {
    score += PRIORITY_SCORES.SENDER_TYPE.SHOPPING;
  } else if (senderType === SENDER_TYPES.MARKETING) {
    score += PRIORITY_SCORES.SENDER_TYPE.MARKETING;
  }

  // 2. Evaluate Metadata flags/labels
  const labels = email.labels || [];
  if (labels.includes("IMPORTANT")) {
    score += PRIORITY_SCORES.FLAGS.IMPORTANT;
  }
  if (labels.includes("STARRED")) {
    score += PRIORITY_SCORES.FLAGS.STARRED;
  }
  if (labels.includes("UNREAD") || email.unread) {
    score += PRIORITY_SCORES.FLAGS.UNREAD;
  }
  
  // Attachments present check
  if (email.attachments && email.attachments.length > 0) {
    score += PRIORITY_SCORES.FLAGS.ATTACHMENT;
  }

  // 3. Evaluate Critical Keywords
  const fieldsToCheck = [email.sender, email.subject, email.snippet, email.body];
  
  // OTP Keywords
  const otpKeywords = ["otp", "one-time password", "verification code", "verification pin", "one time password"];
  if (getMatchedKeywords(fieldsToCheck, otpKeywords).length > 0) {
    score += PRIORITY_SCORES.KEYWORDS.OTP;
  }

  // Interview Keywords
  const interviewKeywords = ["interview", "offer letter", "placement drive", "internship offer", "technical test", "meeting link"];
  if (getMatchedKeywords(fieldsToCheck, interviewKeywords).length > 0) {
    score += PRIORITY_SCORES.KEYWORDS.INTERVIEW;
  }

  // 4. Evaluate category adjustments
  if (category === "BANKING") {
    score += PRIORITY_SCORES.CATEGORIES.BANKING;
  } else if (category === "SECURITY") {
    score += PRIORITY_SCORES.CATEGORIES.SECURITY;
  } else if (category === "PROMOTIONS") {
    score += PRIORITY_SCORES.CATEGORIES.PROMOTIONS;
  } else if (category === "NEWSLETTER") {
    score += PRIORITY_SCORES.CATEGORIES.NEWSLETTER;
  }

  // Cap priority score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Resolve priority level
  let priority = PRIORITY_LEVELS.LOW;
  if (finalScore >= 70) {
    priority = PRIORITY_LEVELS.HIGH;
  } else if (finalScore >= 35) {
    priority = PRIORITY_LEVELS.MEDIUM;
  }

  return {
    score: finalScore,
    priority
  };
};

module.exports = {
  calculatePriority
};
