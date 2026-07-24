const { PRIORITY_LEVELS } = require("../constants/priorityRules");
const { matchesSingleKeyword } = require("../utils/keywordMatcher");
const { parseSender } = require("../utils/senderClassifier");

const PRIORITY_WEIGHTS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

/**
 * Compares two priority levels. Returns true if current >= minimum required.
 * @param {string} current
 * @param {string} minimum
 * @returns {boolean}
 */
const hasRequiredPriority = (current, minimum) => {
  const weightCurrent = PRIORITY_WEIGHTS[current.toUpperCase()] || 1;
  const weightMinimum = PRIORITY_WEIGHTS[minimum.toUpperCase()] || 2;
  return weightCurrent >= weightMinimum;
};

/**
 * Compares email against sender address lists.
 * @param {string} emailAddress
 * @param {string} domain
 * @param {Array<object>} senderList Custom database sender settings list
 * @returns {boolean} Matches any item
 */
const matchesSenderList = (emailAddress, domain, senderList) => {
  if (!senderList || !Array.isArray(senderList)) return false;

  return senderList.some(item => {
    if (!item.enabled) return false;
    
    const cleanEmail = item.email ? item.email.toLowerCase().trim() : "";
    const cleanDomain = item.domain ? item.domain.toLowerCase().trim() : "";
    
    if (cleanEmail && emailAddress.toLowerCase() === cleanEmail) {
      return true;
    }
    if (cleanDomain && domain.toLowerCase() === cleanDomain) {
      return true;
    }
    return false;
  });
};

/**
 * Generates a short notification summary (max 120 characters).
 * @param {object} email
 * @param {string} senderName
 * @param {string} category
 * @returns {string}
 */
const generateSummary = (email, senderName, category) => {
  const subject = email.subject || "";
  const contentForScan = `${subject} ${email.snippet || ""} ${email.body || ""}`.toLowerCase();

  // 1. Amazon template check
  if (senderName.toLowerCase().includes("amazon") && contentForScan.includes("shipped")) {
    return "Amazon: Your package has shipped.";
  }

  // 2. Google Security template check
  if (senderName.toLowerCase().includes("google") && contentForScan.includes("security")) {
    return "Google: Security alert detected.";
  }

  // 3. GitHub template check
  if (senderName.toLowerCase().includes("github") && contentForScan.includes("login")) {
    return "GitHub: New login detected.";
  }

  // 4. Banking Transaction check (e.g. ₹3500 credited)
  if (category === "BANKING") {
    // Matches symbols like ₹, INR, Rs followed by numeric values
    const currencyMatch = contentForScan.match(/(₹|inr|rs\.?)\s*([0-9,]+)/i);
    if (currencyMatch) {
      const isCredit = contentForScan.includes("credited") || contentForScan.includes("received");
      const transactionType = isCredit ? "credited" : "debited";
      return `${senderName}: ${currencyMatch[0].toUpperCase()} ${transactionType}.`;
    }
  }

  // 5. Default Fallback
  const fullText = `${senderName}: ${subject}`;
  if (fullText.length > 120) {
    return fullText.slice(0, 117) + "...";
  }
  return fullText;
};

/**
 * Resolves notification decision pipeline checks.
 * @param {object} email Formatted email details
 * @param {string} category Resolved email category
 * @param {string} priority Resolved priority level
 * @param {number} score Priority score
 * @param {object} userConfig DB user preferences payload
 * @returns {object} Decision payload
 */
const makeNotificationDecision = (email, category, priority, score, userConfig = {}) => {
  const { preferences = [], customKeywords = [], trustedSenders = [], blockedSenders = [] } = userConfig;
  const { name: senderName, email: emailAddress, domain } = parseSender(email.sender);

  // Generate 120-character summary early
  const summary = generateSummary(email, senderName || "System", category);

  // Pipeline check 1: Blocked Senders list (Highest priority override)
  if (matchesSenderList(emailAddress, domain, blockedSenders)) {
    return {
      shouldNotify: false,
      reason: "Sender address or domain blocked by user list filters",
      category,
      priority,
      score,
      summary
    };
  }

  // Pipeline check 2: Trusted Senders list
  if (matchesSenderList(emailAddress, domain, trustedSenders)) {
    return {
      shouldNotify: true,
      reason: "Sender address or domain whitelisted on trusted list",
      category,
      priority,
      score,
      summary
    };
  }

  // Pipeline check 3: Custom user keywords match
  const fieldsToCheck = [email.sender, email.subject, email.snippet, email.body];
  const matchedCustomKeyword = customKeywords.find(item => 
    item.enabled && matchesSingleKeyword(fieldsToCheck, item.keyword)
  );
  if (matchedCustomKeyword) {
    return {
      shouldNotify: true,
      reason: `Custom user keyword match: "${matchedCustomKeyword.keyword}"`,
      category,
      priority,
      score,
      summary
    };
  }

  // Pipeline check 4: Default user notification preference configuration
  const pref = preferences.find(p => p.category.toUpperCase() === category.toUpperCase());
  if (pref) {
    if (!pref.enabled) {
      return {
        shouldNotify: false,
        reason: `Notifications are disabled for category "${category}"`,
        category,
        priority,
        score,
        summary
      };
    }

    if (!hasRequiredPriority(priority, pref.minimumPriority)) {
      return {
        shouldNotify: false,
        reason: `Email priority "${priority}" is below minimum requirement "${pref.minimumPriority}" set for category "${category}"`,
        category,
        priority,
        score,
        summary
      };
    }

    return {
      shouldNotify: true,
      reason: `Matches default preferences for category "${category}"`,
      category,
      priority,
      score,
      summary
    };
  }

  // Default Fallback
  return {
    shouldNotify: false,
    reason: "No preferences or keyword match found for this email categorization",
    category,
    priority,
    score,
    summary
  };
};

module.exports = {
  makeNotificationDecision,
  generateSummary
};
