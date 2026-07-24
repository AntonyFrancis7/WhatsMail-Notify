const preferenceService = require("../services/preferenceService");

/**
 * GET /api/preferences
 * Returns the authenticated user's notification settings and list items.
 */
const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[PREFERENCE_CONTROLLER] Fetching settings for user ID: ${userId}`);

    const [preferences, customKeywords, trustedSenders, blockedSenders] = await Promise.all([
      preferenceService.getPreferences(userId),
      preferenceService.getCustomKeywords(userId),
      preferenceService.getTrustedSenders(userId),
      preferenceService.getBlockedSenders(userId)
    ]);

    res.status(200).json({
      success: true,
      message: "Preferences retrieved successfully",
      data: {
        preferences,
        customKeywords,
        trustedSenders,
        blockedSenders
      }
    });
  } catch (error) {
    console.error(`[PREFERENCE_CONTROLLER_ERROR] Failed to fetch preferences: ${error.message}`);
    next(error);
  }
};

/**
 * PUT /api/preferences
 * Updates user notification preference mappings (category enable flags & minimum priority thresholds).
 */
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: "Preferences parameter is required and must be an array."
      });
    }

    console.log(`[PREFERENCE_CONTROLLER] Bulk updating category preferences for user ID: ${userId}`);
    const updatedPreferences = await preferenceService.updatePreferences(userId, preferences);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: updatedPreferences
    });
  } catch (error) {
    console.error(`[PREFERENCE_CONTROLLER_ERROR] Failed to update preferences: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/preferences/default
 * Returns default preferences templates.
 */
const getDefaultPreferences = (req, res) => {
  console.log("[PREFERENCE_CONTROLLER] Fetching default settings template.");
  const defaults = preferenceService.getDefaultPreferences();
  res.status(200).json({
    success: true,
    data: defaults
  });
};

/**
 * POST /api/preferences/keywords
 * Adds an enabled custom keyword.
 */
const addCustomKeyword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ success: false, message: "Keyword parameter is required." });
    }

    const result = await preferenceService.addCustomKeyword(userId, keyword);
    res.status(201).json({ success: true, message: "Keyword added successfully", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/preferences/keywords/:id
 * Removes a custom keyword.
 */
const deleteCustomKeyword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await preferenceService.deleteCustomKeyword(userId, id);
    res.status(200).json({ success: true, message: "Keyword deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/preferences/trusted
 * Adds a trusted email or domain.
 */
const addTrustedSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, domain } = req.body;

    const result = await preferenceService.addTrustedSender(userId, email, domain);
    res.status(201).json({ success: true, message: "Trusted sender added successfully", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/preferences/trusted/:id
 * Removes a trusted sender rule.
 */
const deleteTrustedSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await preferenceService.deleteTrustedSender(userId, id);
    res.status(200).json({ success: true, message: "Trusted sender deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/preferences/blocked
 * Adds a blocked email or domain.
 */
const addBlockedSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, domain } = req.body;

    const result = await preferenceService.addBlockedSender(userId, email, domain);
    res.status(201).json({ success: true, message: "Blocked sender added successfully", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/preferences/blocked/:id
 * Removes a blocked sender rule.
 */
const deleteBlockedSender = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await preferenceService.deleteBlockedSender(userId, id);
    res.status(200).json({ success: true, message: "Blocked sender deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  getDefaultPreferences,
  addCustomKeyword,
  deleteCustomKeyword,
  addTrustedSender,
  deleteTrustedSender,
  addBlockedSender,
  deleteBlockedSender
};
