const { CATEGORIES } = require("./categories");
const { PRIORITY_LEVELS } = require("./priorityRules");

const DEFAULT_PREFERENCES = [
  { category: CATEGORIES.BANKING, enabled: true, minimumPriority: PRIORITY_LEVELS.HIGH },
  { category: CATEGORIES.SECURITY, enabled: true, minimumPriority: PRIORITY_LEVELS.HIGH },
  { category: CATEGORIES.OTP, enabled: true, minimumPriority: PRIORITY_LEVELS.HIGH },
  { category: CATEGORIES.WORK, enabled: true, minimumPriority: PRIORITY_LEVELS.MEDIUM },
  { category: CATEGORIES.JOB, enabled: true, minimumPriority: PRIORITY_LEVELS.MEDIUM },
  { category: CATEGORIES.SHOPPING, enabled: false, minimumPriority: PRIORITY_LEVELS.MEDIUM },
  { category: CATEGORIES.DELIVERY, enabled: false, minimumPriority: PRIORITY_LEVELS.MEDIUM },
  { category: CATEGORIES.SOCIAL, enabled: false, minimumPriority: PRIORITY_LEVELS.LOW },
  { category: CATEGORIES.PROMOTIONS, enabled: false, minimumPriority: PRIORITY_LEVELS.LOW },
  { category: CATEGORIES.NEWSLETTER, enabled: false, minimumPriority: PRIORITY_LEVELS.LOW },
  { category: CATEGORIES.UNKNOWN, enabled: false, minimumPriority: PRIORITY_LEVELS.HIGH }
];

module.exports = {
  DEFAULT_PREFERENCES
};
