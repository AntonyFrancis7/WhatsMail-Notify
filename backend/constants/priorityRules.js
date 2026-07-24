const PRIORITY_SCORES = {
  // Sender classifications
  SENDER_TYPE: {
    BANK: 35,
    SECURITY: 35,
    TRUSTED: 20,
    GOVERNMENT: 30,
    WORK: 25,
    SHOPPING: 25,
    MARKETING: -20
  },
  
  // Gmail metadata flags
  FLAGS: {
    IMPORTANT: 20,
    STARRED: 15,
    UNREAD: 10,
    ATTACHMENT: 5
  },
  
  // Critical keyword flags
  KEYWORDS: {
    OTP: 40,
    INTERVIEW: 35
  },
  
  // General category boosts/tags
  CATEGORIES: {
    BANKING: 25,
    SECURITY: 25,
    PROMOTIONS: -25,
    NEWSLETTER: -20
  }
};

const PRIORITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
};

module.exports = {
  PRIORITY_SCORES,
  PRIORITY_LEVELS
};
