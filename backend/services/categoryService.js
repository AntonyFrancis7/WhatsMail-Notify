const { CATEGORIES } = require("../constants/categories");
const { classifySender, SENDER_TYPES } = require("../utils/senderClassifier");
const { getMatchedKeywords } = require("../utils/keywordMatcher");

/**
 * Determines the category of an email using sender, labels, and content keyword checks.
 * @param {object} email formatted email details
 * @returns {string} Category name
 */
const classifyEmailCategory = (email) => {
  if (!email) return CATEGORIES.UNKNOWN;

  const senderStr = email.sender || "";
  const subject = email.subject || "";
  const body = email.body || "";
  const snippet = email.snippet || "";
  const labels = email.labels || [];

  // Analyze Sender
  const senderAnalysis = classifySender(senderStr);
  const senderType = senderAnalysis.senderType;
  const domain = senderAnalysis.domain;
  const emailLower = senderAnalysis.email;

  const fieldsToCheck = [senderStr, subject, snippet, body];

  // 1. OTP Checks (Highest priority - time critical)
  const otpKeywords = ["otp", "one-time password", "verification code", "verification pin", "one time password", "validation code"];
  if (getMatchedKeywords(fieldsToCheck, otpKeywords).length > 0 || subject.toLowerCase().includes("otp")) {
    return CATEGORIES.OTP;
  }

  // 2. Direct Domain / Sender Type Checks (Classifies known brands reliably)
  if (domain === "accounts.google.com" || emailLower.startsWith("security@") || senderType === SENDER_TYPES.SECURITY) {
    return CATEGORIES.SECURITY;
  }

  if (domain === "paypal.com" || senderType === SENDER_TYPES.BANK) {
    return CATEGORIES.BANKING;
  }

  if (domain === "github.com" || domain === "slack.com" || senderType === SENDER_TYPES.WORK) {
    return CATEGORIES.WORK;
  }

  if (domain === "linkedin.com" || domain === "indeed.com" || emailLower.includes("internshala") || senderType === SENDER_TYPES.SOCIAL) {
    // If it has job search keywords, prioritize JOB over general SOCIAL
    const jobKeywords = ["interview", "offer letter", "internship", "placement", "hiring", "hired", "job application", "career opportunities"];
    if (getMatchedKeywords(fieldsToCheck, jobKeywords).length > 0) {
      return CATEGORIES.JOB;
    }
    return CATEGORIES.SOCIAL;
  }

  if (domain.includes("amazon") || domain.includes("flipkart") || domain.includes("ebay") || senderType === SENDER_TYPES.SHOPPING) {
    return CATEGORIES.SHOPPING;
  }

  if (senderType === SENDER_TYPES.GOVERNMENT || domain.endsWith(".gov") || domain.endsWith(".gov.in")) {
    return CATEGORIES.GOVERNMENT;
  }

  if (domain.endsWith(".edu") || domain === "ktu.edu") {
    return CATEGORIES.EDUCATION;
  }

  // 3. Keyword Heuristic Checks on Content (For unknown/general senders)
  const securityKeywords = ["security alert", "new login", "password reset", "unauthorized access", "compromised", "blocked login", "reset your password", "auth alert"];
  if (getMatchedKeywords(fieldsToCheck, securityKeywords).length > 0) {
    return CATEGORIES.SECURITY;
  }

  const bankingKeywords = ["credited", "debited", "bank statement", "transaction alert", "payment failed", "otp banking", "card alert", "withdrawn", "payment successful", "invoice", "receipt"];
  if (getMatchedKeywords(fieldsToCheck, bankingKeywords).length > 0) {
    return CATEGORIES.BANKING;
  }

  const workKeywords = ["meeting", "deadline", "standup", "atlassian", "jira", "confluence", "pull request", "commit history", "zoom link"];
  if (getMatchedKeywords(fieldsToCheck, workKeywords).length > 0) {
    return CATEGORIES.WORK;
  }

  const jobKeywords = ["interview", "offer letter", "internship", "placement", "hiring", "hired", "job application", "career opportunities", "resume"];
  if (getMatchedKeywords(fieldsToCheck, jobKeywords).length > 0) {
    return CATEGORIES.JOB;
  }

  const educationKeywords = ["assignment", "syllabus", "coursework", "grades", "academic", "university", "ktu.edu", "exam results"];
  if (getMatchedKeywords(fieldsToCheck, educationKeywords).length > 0) {
    return CATEGORIES.EDUCATION;
  }

  const billKeywords = ["bill due", "premium renewal", "subscription active", "invoice unpaid", "electricity bill", "payment reminder"];
  if (getMatchedKeywords(fieldsToCheck, billKeywords).length > 0) {
    return CATEGORIES.BILLS;
  }

  const deliveryKeywords = ["package shipped", "out for delivery", "tracking status", "shipment details", "courier tracking", "delivered", "delivering today"];
  if (getMatchedKeywords(fieldsToCheck, deliveryKeywords).length > 0) {
    return CATEGORIES.DELIVERY;
  }

  const travelKeywords = ["flight ticket", "hotel booking", "boarding pass", "travel itinerary", "booking confirmed", "ticket reservation", "irctc", "pnr"];
  if (getMatchedKeywords(fieldsToCheck, travelKeywords).length > 0) {
    return CATEGORIES.TRAVEL;
  }

  const promotionsKeywords = ["discount", "coupon", "limited offer", "sale ends", "exclusive deal", "special offer", "buy now"];
  if (senderType === SENDER_TYPES.MARKETING || labels.includes("CATEGORY_PROMOTIONS") || getMatchedKeywords(fieldsToCheck, promotionsKeywords).length > 0) {
    return CATEGORIES.PROMOTIONS;
  }

  const newsletterKeywords = ["newsletter", "weekly digest", "recommended reading", "trending today", "read more"];
  if (labels.includes("CATEGORY_UPDATES") || getMatchedKeywords(fieldsToCheck, newsletterKeywords).length > 0) {
    return CATEGORIES.NEWSLETTER;
  }

  // 4. Default categories based on Gmail Labels
  if (labels.includes("CATEGORY_SOCIAL")) {
    return CATEGORIES.SOCIAL;
  }

  if (labels.includes("CATEGORY_PERSONAL")) {
    return CATEGORIES.PERSONAL;
  }

  return CATEGORIES.UNKNOWN;
};

module.exports = {
  classifyEmailCategory
};
