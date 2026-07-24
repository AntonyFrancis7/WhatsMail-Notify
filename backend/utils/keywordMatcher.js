const KEYWORD_GROUPS = {
  HIGH: [
    "otp", "password", "verification", "security", "fraud", "alert", "login", 
    "interview", "offer letter", "meeting", "exam", "deadline", "scholarship", 
    "payment failed", "invoice"
  ],
  MEDIUM: [
    "delivery", "refund", "attendance", "placement", "internship", "assignment", 
    "hackathon", "reminder"
  ],
  LOW: [
    "sale", "offer", "discount", "promotion", "recommended", "trending", "newsletter"
  ]
};

/**
 * Searches a list of text fields for any occurrence of the given keywords.
 * @param {Array<string>} fields
 * @param {Array<string>} keywords
 * @returns {Array<string>} List of matched keywords
 */
const getMatchedKeywords = (fields, keywords) => {
  if (!fields || !keywords || !Array.isArray(fields) || !Array.isArray(keywords)) {
    return [];
  }
  
  const cleanFields = fields
    .filter(f => typeof f === "string" && f.trim().length > 0)
    .map(f => f.toLowerCase());
    
  const matched = [];
  keywords.forEach(kw => {
    const kwLower = kw.toLowerCase().trim();
    if (kwLower.length === 0) return;
    
    if (cleanFields.some(field => field.includes(kwLower))) {
      matched.push(kw);
    }
  });
  
  return matched;
};

/**
 * Checks if a specific keyword matches any of the fields.
 * @param {Array<string>} fields
 * @param {string} keyword
 * @returns {boolean}
 */
const matchesSingleKeyword = (fields, keyword) => {
  if (!fields || !keyword || typeof keyword !== "string") return false;
  return getMatchedKeywords(fields, [keyword]).length > 0;
};

module.exports = {
  KEYWORD_GROUPS,
  getMatchedKeywords,
  matchesSingleKeyword
};
