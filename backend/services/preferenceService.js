const { prisma } = require("../config/db");
const { DEFAULT_PREFERENCES } = require("../constants/defaultNotificationPreferences");

/**
 * Retrieves the user's notification preferences.
 * Lazy-initializes defaults if the database returns 0 records.
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getPreferences = async (userId) => {
  let preferences = await prisma.notificationPreference.findMany({
    where: { userId }
  });

  if (preferences.length === 0) {
    console.log(`[PREFERENCE] Database profile missing settings for user ${userId}. Initializing self-healing defaults.`);
    const defaultData = DEFAULT_PREFERENCES.map(p => ({
      userId,
      category: p.category,
      enabled: p.enabled,
      minimumPriority: p.minimumPriority
    }));

    await prisma.notificationPreference.createMany({
      data: defaultData
    });

    preferences = await prisma.notificationPreference.findMany({
      where: { userId }
    });
  }

  return preferences;
};

/**
 * Updates a batch of notification preferences.
 * @param {string} userId
 * @param {Array<object>} preferencesArray
 * @returns {Promise<Array<object>>}
 */
const updatePreferences = async (userId, preferencesArray) => {
  if (!Array.isArray(preferencesArray)) {
    throw new Error("Invalid request structure. Preferences must be an array.");
  }

  console.log(`[PREFERENCE] Bulk updating preferences settings for user ${userId}`);
  const tasks = preferencesArray.map(pref => {
    return prisma.notificationPreference.upsert({
      where: {
        userId_category: {
          userId,
          category: pref.category
        }
      },
      update: {
        enabled: pref.enabled,
        minimumPriority: pref.minimumPriority
      },
      create: {
        userId,
        category: pref.category,
        enabled: pref.enabled,
        minimumPriority: pref.minimumPriority
      }
    });
  });

  await Promise.all(tasks);
  return getPreferences(userId);
};

/**
 * Returns default preferences template without user bindings.
 * @returns {Array<object>}
 */
const getDefaultPreferences = () => {
  return DEFAULT_PREFERENCES;
};

/**
 * Get user's custom keywords.
 */
const getCustomKeywords = async (userId) => {
  return prisma.customKeyword.findMany({ where: { userId } });
};

/**
 * Adds a custom keyword.
 */
const addCustomKeyword = async (userId, keyword) => {
  if (!keyword || typeof keyword !== "string") {
    throw new Error("Keyword text parameter is required.");
  }
  return prisma.customKeyword.upsert({
    where: {
      userId_keyword: {
        userId,
        keyword: keyword.toLowerCase().trim()
      }
    },
    update: { enabled: true },
    create: {
      userId,
      keyword: keyword.toLowerCase().trim(),
      enabled: true
    }
  });
};

/**
 * Removes/Deletes a custom keyword.
 */
const deleteCustomKeyword = async (userId, id) => {
  return prisma.customKeyword.deleteMany({
    where: { id, userId }
  });
};

/**
 * Get user's trusted senders list.
 */
const getTrustedSenders = async (userId) => {
  return prisma.trustedSender.findMany({ where: { userId } });
};

/**
 * Adds a trusted sender.
 */
const addTrustedSender = async (userId, email = null, domain = null) => {
  if (!email && !domain) {
    throw new Error("Email or domain name parameter is required.");
  }
  const cleanEmail = email ? email.toLowerCase().trim() : null;
  const cleanDomain = domain ? domain.toLowerCase().trim() : null;

  const existing = await prisma.trustedSender.findFirst({
    where: {
      userId,
      email: cleanEmail,
      domain: cleanDomain
    }
  });

  if (existing) {
    return prisma.trustedSender.update({
      where: { id: existing.id },
      data: { enabled: true }
    });
  }

  return prisma.trustedSender.create({
    data: {
      userId,
      email: cleanEmail,
      domain: cleanDomain,
      enabled: true
    }
  });
};

/**
 * Removes/Deletes a trusted sender.
 */
const deleteTrustedSender = async (userId, id) => {
  return prisma.trustedSender.deleteMany({
    where: { id, userId }
  });
};

/**
 * Get user's blocked senders list.
 */
const getBlockedSenders = async (userId) => {
  return prisma.blockedSender.findMany({ where: { userId } });
};

/**
 * Adds a blocked sender.
 */
const addBlockedSender = async (userId, email = null, domain = null) => {
  if (!email && !domain) {
    throw new Error("Email or domain name parameter is required.");
  }
  const cleanEmail = email ? email.toLowerCase().trim() : null;
  const cleanDomain = domain ? domain.toLowerCase().trim() : null;

  const existing = await prisma.blockedSender.findFirst({
    where: {
      userId,
      email: cleanEmail,
      domain: cleanDomain
    }
  });

  if (existing) {
    return prisma.blockedSender.update({
      where: { id: existing.id },
      data: { enabled: true }
    });
  }

  return prisma.blockedSender.create({
    data: {
      userId,
      email: cleanEmail,
      domain: cleanDomain,
      enabled: true
    }
  });
};

/**
 * Removes/Deletes a blocked sender.
 */
const deleteBlockedSender = async (userId, id) => {
  return prisma.blockedSender.deleteMany({
    where: { id, userId }
  });
};

module.exports = {
  getPreferences,
  updatePreferences,
  getDefaultPreferences,
  getCustomKeywords,
  addCustomKeyword,
  deleteCustomKeyword,
  getTrustedSenders,
  addTrustedSender,
  deleteTrustedSender,
  getBlockedSenders,
  addBlockedSender,
  deleteBlockedSender
};
