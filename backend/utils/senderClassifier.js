const SENDER_TYPES = {
  TRUSTED: "Trusted",
  BANK: "Bank",
  SECURITY: "Security",
  GOVERNMENT: "Government",
  SHOPPING: "Shopping",
  WORK: "Work",
  MARKETING: "Marketing",
  SOCIAL: "Social",
  UNKNOWN: "Unknown"
};

const BANK_DOMAINS = [
  "paypal.com", "chase.com", "hdfcbank.com", "icicibank.com", "sbi.co.in", 
  "hsbc.com", "bankofamerica.com", "wellsfargo.com", "citibank.com", 
  "amex.com", "americanexpress.com", "capitalone.com"
];

const SHOPPING_DOMAINS = [
  "amazon.com", "amazon.in", "flipkart.com", "ebay.com", "walmart.com", 
  "target.com", "shopify.com"
];

const WORK_DOMAINS = [
  "github.com", "slack.com", "jira.com", "atlassian.com", "trello.com", 
  "microsoft.com", "zoom.us"
];

const SOCIAL_DOMAINS = [
  "linkedin.com", "facebookmail.com", "instagram.com", "twitter.com", 
  "x.com", "pinterest.com"
];

const GOVERNMENT_SUFFIXES = [
  ".gov", ".gov.in", ".gov.uk", ".mil", ".edu.gov"
];

const SECURITY_DOMAINS = [
  "accounts.google.com"
];

/**
 * Parses email string (e.g. "GitHub <noreply@github.com>" or "noreply@github.com") 
 * to extract email and domain.
 * @param {string} senderStr
 * @returns {{name: string, email: string, domain: string}}
 */
const parseSender = (senderStr) => {
  if (!senderStr || typeof senderStr !== "string") {
    return { name: "", email: "", domain: "" };
  }

  let name = "";
  let email = senderStr.trim();

  const emailMatch = senderStr.match(/<([^>]+)>/);
  if (emailMatch) {
    email = emailMatch[1].trim();
    name = senderStr.split("<")[0].replace(/"/g, "").trim();
  }

  const emailLower = email.toLowerCase();
  const domain = emailLower.split("@")[1] || "";

  return { name, email: emailLower, domain };
};

/**
 * Classifies the sender into category types.
 * @param {string} senderStr Raw sender header (e.g. "GitHub <noreply@github.com>")
 * @param {Array<string>} userTrustedEmails Custom list of trusted emails from db
 * @param {Array<string>} userTrustedDomains Custom list of trusted domains from db
 * @returns {{senderType: string, confidence: number, email: string, domain: string}}
 */
const classifySender = (senderStr, userTrustedEmails = [], userTrustedDomains = []) => {
  const { name, email, domain } = parseSender(senderStr);

  if (!email) {
    return { senderType: SENDER_TYPES.UNKNOWN, confidence: 0.0, email: "", domain: "" };
  }

  // 1. Check custom trusted lists (Highest Priority)
  if (userTrustedEmails.includes(email) || userTrustedDomains.includes(domain)) {
    return { senderType: SENDER_TYPES.TRUSTED, confidence: 1.0, email, domain };
  }

  // 2. Check direct domain dictionaries
  if (SECURITY_DOMAINS.includes(domain)) {
    return { senderType: SENDER_TYPES.SECURITY, confidence: 1.0, email, domain };
  }

  if (BANK_DOMAINS.includes(domain)) {
    return { senderType: SENDER_TYPES.BANK, confidence: 1.0, email, domain };
  }
  
  if (SHOPPING_DOMAINS.includes(domain)) {
    return { senderType: SENDER_TYPES.SHOPPING, confidence: 1.0, email, domain };
  }

  if (WORK_DOMAINS.includes(domain)) {
    return { senderType: SENDER_TYPES.WORK, confidence: 1.0, email, domain };
  }

  if (SOCIAL_DOMAINS.includes(domain)) {
    return { senderType: SENDER_TYPES.SOCIAL, confidence: 1.0, email, domain };
  }

  // 3. Government suffixes
  if (GOVERNMENT_SUFFIXES.some(suffix => domain.endsWith(suffix))) {
    return { senderType: SENDER_TYPES.GOVERNMENT, confidence: 1.0, email, domain };
  }

  // 4. Heuristic text checks
  const emailLocalPart = email.split("@")[0] || "";
  const textToCheck = `${name} ${emailLocalPart}`.toLowerCase();

  if (textToCheck.includes("bank") || textToCheck.includes("billing") || textToCheck.includes("payment")) {
    return { senderType: SENDER_TYPES.BANK, confidence: 0.8, email, domain };
  }

  if (textToCheck.includes("security") || textToCheck.includes("accounts") || textToCheck.includes("verify")) {
    return { senderType: SENDER_TYPES.SECURITY, confidence: 0.75, email, domain }; // Security classifier indicator
  }

  if (textToCheck.includes("newsletter") || textToCheck.includes("promo") || textToCheck.includes("marketing") || textToCheck.includes("offer")) {
    return { senderType: SENDER_TYPES.MARKETING, confidence: 0.85, email, domain };
  }

  if (domain.startsWith("bounce.") || domain.includes("mailchimp") || domain.includes("sendgrid")) {
    return { senderType: SENDER_TYPES.MARKETING, confidence: 0.9, email, domain };
  }

  return {
    senderType: SENDER_TYPES.UNKNOWN,
    confidence: 0.1,
    email,
    domain
  };
};

module.exports = {
  SENDER_TYPES,
  parseSender,
  classifySender
};
