const emailProcessorService = require("../services/emailProcessorService");
const rulesEngine = require("../services/rulesEngine");
const preferenceService = require("../services/preferenceService");
const { CATEGORIES } = require("../constants/categories");
const { PRIORITY_LEVELS } = require("../constants/priorityRules");

/**
 * GET /api/processor/analyze/:messageId
 * Resolves a real email from Gmail and returns its classification profile.
 */
const analyzeRealEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID parameter is required."
      });
    }

    console.log(`[PROCESSOR_CONTROLLER] Real email analysis requested for ID: ${messageId}`);
    const analysisResult = await emailProcessorService.processAndAnalyzeEmail(userId, messageId);

    res.status(200).json({
      success: true,
      message: "Email analyzed successfully",
      data: analysisResult
    });
  } catch (error) {
    console.error(`[PROCESSOR_CONTROLLER_ERROR] Real email analysis failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/processor/analyze
 * Dry-run mock analysis for arbitrary email bodies (useful for developer dry-run tests).
 */
const analyzeMockEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const emailBody = req.body;

    if (!emailBody || !emailBody.sender || !emailBody.subject) {
      return res.status(400).json({
        success: false,
        message: "Sender and subject are required in mock email payload."
      });
    }

    console.log("[PROCESSOR_CONTROLLER] Mock email analysis requested.");
    const analysisResult = await rulesEngine.evaluateEmail(userId, emailBody);

    res.status(200).json({
      success: true,
      message: "Mock email evaluated successfully",
      data: {
        mockEmail: emailBody,
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error(`[PROCESSOR_CONTROLLER_ERROR] Mock analysis failed: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/processor/test
 * Comprehensive automated QA verification endpoint that validates the intelligence rules.
 */
const runQATests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[QA_TESTS] Initiating backend intelligence validation suite for user: ${userId}`);

    const results = [];
    let testsPassed = 0;

    // Helper to evaluate mock cases
    const runCase = async (title, emailPayload, verifyFn) => {
      try {
        const analysis = await rulesEngine.evaluateEmail(userId, emailPayload);
        const errorMsg = verifyFn(analysis);
        if (errorMsg) {
          results.push({ test: title, status: "FAILED", details: errorMsg, analysis });
        } else {
          results.push({ test: title, status: "PASSED", analysis });
          testsPassed++;
        }
      } catch (err) {
        results.push({ test: title, status: "ERROR", details: err.message });
      }
    };

    // Test Case 1: Bank email (High Priority)
    await runCase(
      "Bank Alert Verification",
      {
        sender: "ICICI Bank Alerts <alerts@icicibank.com>",
        subject: "Rs. 3,500 Credited to your account",
        body: "Your savings account has been credited with INR 3,500.00.",
        snippet: "Rs. 3500 credited to account",
        labels: ["INBOX"],
        unread: true,
        attachments: []
      },
      (ans) => {
        if (ans.category !== CATEGORIES.BANKING) return `Expected category BANKING, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.HIGH) return `Expected priority HIGH, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 2: OTP email (High Priority)
    await runCase(
      "OTP Code Verification",
      {
        sender: "Secure Logins <no-reply@accounts.google.com>",
        subject: "Your OTP code is 582910",
        body: "Please use verification code 582910 to validate your login credentials.",
        snippet: "Your OTP is 582910",
        labels: ["INBOX"],
        unread: true,
        attachments: []
      },
      (ans) => {
        if (ans.category !== CATEGORIES.OTP) return `Expected category OTP, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.HIGH) return `Expected priority HIGH, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 3: Google Security (High Priority)
    await runCase(
      "Google Security Alert",
      {
        sender: "Google accounts <no-reply@accounts.google.com>",
        subject: "Security alert: new sign-in detected",
        body: "A new device logged in to your Google Account.",
        snippet: "Security alert: new sign-in",
        labels: ["INBOX", "IMPORTANT"],
        unread: true,
        attachments: []
      },
      (ans) => {
        if (ans.category !== CATEGORIES.SECURITY) return `Expected category SECURITY, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.HIGH) return `Expected priority HIGH, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 4: GitHub Email (Medium Priority)
    await runCase(
      "GitHub Work Alert",
      {
        sender: "GitHub Support <noreply@github.com>",
        subject: "[GitHub] Pull Request #14 Opened",
        body: "User antonyfrancis opened a new pull request in WhatsMail-Notify repository.",
        snippet: "Pull request opened",
        labels: ["INBOX"],
        unread: true,
        attachments: []
      },
      (ans) => {
        if (ans.category !== CATEGORIES.WORK) return `Expected category WORK, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.MEDIUM) return `Expected priority MEDIUM, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 5: Amazon Email (Medium Priority)
    await runCase(
      "Amazon Shopping Match",
      {
        sender: "Amazon.in <auto-confirm@amazon.in>",
        subject: "Order Confirmation: Your Amazon purchase",
        body: "Thank you for buying. Your order will arrive soon.",
        snippet: "Order confirmed",
        labels: ["INBOX"],
        unread: true,
        attachments: []
      },
      (ans) => {
        // Amazon domains map to SHOPPING category
        if (ans.category !== CATEGORIES.SHOPPING) return `Expected category SHOPPING, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.MEDIUM) return `Expected priority MEDIUM, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 6: Newsletter/Marketing (Low Priority)
    await runCase(
      "Newsletter Marketing Category",
      {
        sender: "Discount Deals <offers@marketing-brand.com>",
        subject: "Exclusive weekly digest and 40% discount promo",
        body: "Get weekly updates and promotion codes inside our newsletter coupon discount.",
        snippet: "Weekly promotion discounts",
        labels: ["CATEGORY_PROMOTIONS"],
        unread: false,
        attachments: []
      },
      (ans) => {
        if (ans.category !== CATEGORIES.PROMOTIONS) return `Expected category PROMOTIONS, got ${ans.category}`;
        if (ans.priority !== PRIORITY_LEVELS.LOW) return `Expected priority LOW, got ${ans.priority}`;
        return null;
      }
    );

    // Test Case 7: Blocked Sender Overrides (shouldNotify = false)
    console.log("[QA_TESTS] Adding temporary Blocked Sender record");
    const blockedRecord = await preferenceService.addBlockedSender(userId, null, "spammer-domain.com");
    await runCase(
      "Blocked Sender Override",
      {
        sender: "Bad Actor <alert@spammer-domain.com>",
        subject: "Urgent: Reset password banking OTP alert", // Content is OTP but sender is blocked
        body: "Verification alert code pin code statement.",
        labels: ["INBOX"],
        unread: true
      },
      (ans) => {
        if (ans.shouldNotify !== false) return `Expected shouldNotify = false, got ${ans.shouldNotify}`;
        if (!ans.reason.toLowerCase().includes("blocked")) return `Expected block reason override, got "${ans.reason}"`;
        return null;
      }
    );
    await preferenceService.deleteBlockedSender(userId, blockedRecord.id);

    // Test Case 8: Trusted Sender Overrides (shouldNotify = true)
    console.log("[QA_TESTS] Adding temporary Trusted Sender record");
    const trustedRecord = await preferenceService.addTrustedSender(userId, "vip@friend.com");
    await runCase(
      "Trusted Sender Override",
      {
        sender: "Best Friend <vip@friend.com>",
        subject: "Weekend newsletter digest recommended promo", // Low priority content
        body: "Discount recommendation weekly newsletter logs.",
        labels: ["INBOX"],
        unread: false
      },
      (ans) => {
        if (ans.shouldNotify !== true) return `Expected shouldNotify = true, got ${ans.shouldNotify}`;
        if (!ans.reason.toLowerCase().includes("trusted") && !ans.reason.toLowerCase().includes("whitelist")) {
          return `Expected trusted whitelist reason override, got "${ans.reason}"`;
        }
        return null;
      }
    );
    await preferenceService.deleteTrustedSender(userId, trustedRecord.id);

    // Test Case 9: Unknown Sender (Unknown Category & Disabled Default Preference check)
    await runCase(
      "Unknown Sender default",
      {
        sender: "Xavier <x-man@mutant-school.com>",
        subject: "New class timings schedule",
        body: "Classes starting on Monday mornings.",
        labels: ["INBOX"],
        unread: false
      },
      (ans) => {
        if (ans.category !== CATEGORIES.UNKNOWN) return `Expected category UNKNOWN, got ${ans.category}`;
        // UNKNOWN category default is disabled, shouldNotify should be false
        if (ans.shouldNotify !== false) return `Expected shouldNotify = false (UNKNOWN defaults disabled), got ${ans.shouldNotify}`;
        return null;
      }
    );

    const success = testsPassed === results.length;
    console.log(`[QA_TESTS] Completed. Results: ${testsPassed}/${results.length} tests passed.`);

    res.status(200).json({
      success,
      message: `QA Intelligence tests completed. ${testsPassed}/${results.length} passed.`,
      tests: results
    });
  } catch (error) {
    console.error(`[QA_TESTS_ERROR] Validation runner failed: ${error.message}`);
    next(error);
  }
};

module.exports = {
  analyzeRealEmail,
  analyzeMockEmail,
  runQATests
};
