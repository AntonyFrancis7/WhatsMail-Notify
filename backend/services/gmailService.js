const { google } = require("googleapis");
const { prisma } = require("../config/db");
const googleAuthService = require("./googleAuthService");
const gmailFormatter = require("../utils/gmailFormatter");

// Keep track of active token refresh operations to prevent parallel execution/database locks
const activeRefreshes = new Map();

/**
 * Creates an authenticated Google APIs OAuth2 client instance.
 * @param {object} user
 * @returns {object} oauth2Client
 */
const getGmailClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken
  });
  
  return google.gmail({ version: "v1", auth: oauth2Client });
};

/**
 * Concurrent-safe token refresh manager. Reuses in-progress promises.
 * @param {string} userId
 * @param {string} refreshToken
 * @returns {Promise<object>} updatedUser
 */
const refreshUserToken = async (userId, refreshToken) => {
  if (activeRefreshes.has(userId)) {
    console.log(`[GMAIL] Token refresh already in progress for user ${userId}. Reusing existing promise.`);
    return activeRefreshes.get(userId);
  }
  
  const refreshPromise = (async () => {
    try {
      const credentials = await googleAuthService.refreshAccessToken(refreshToken);
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: credentials.access_token,
          ...(credentials.refresh_token && { refreshToken: credentials.refresh_token })
        }
      });
      
      console.log(`[GMAIL] Token Refreshed successfully for user ${userId}`);
      return updatedUser;
    } finally {
      activeRefreshes.delete(userId);
    }
  })();
  
  activeRefreshes.set(userId, refreshPromise);
  return refreshPromise;
};

/**
 * Helper wrapper that fetches the user, initializes the Gmail client,
 * executes a function block, and automatically refreshes tokens on auth failures.
 * @param {string} userId
 * @param {Function} apiCallFn
 * @returns {Promise<any>}
 */
const executeGmailCall = async (userId, apiCallFn) => {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.accessToken) {
    throw new Error("Google account access token missing. Please reconnect your account.");
  }
  
  let gmail = getGmailClient(user);
  try {
    return await apiCallFn(gmail);
  } catch (error) {
    const errorStatus = error.code || (error.response && error.response.status);
    const isAuthError =
      errorStatus === 401 ||
      error.message.includes("invalid_grant") ||
      error.message.includes("invalid_credentials") ||
      error.message.includes("credentials");

    if (isAuthError && user.refreshToken) {
      console.log(`[GMAIL] Access token expired or invalid for user ${userId}. Attempting concurrent-safe refresh...`);
      try {
        const refreshedUser = await refreshUserToken(userId, user.refreshToken);
        
        // Re-execute Gmail client using refreshed credentials
        gmail = getGmailClient(refreshedUser);
        return await apiCallFn(gmail);
      } catch (refreshError) {
        console.error(`[GMAIL_ERROR] Failed to refresh token for user ${userId}: ${refreshError.message}`);
        throw new Error("Google login session expired. Please sign in again.");
      }
    }
    
    console.error(`[GMAIL_ERROR] Gmail API call failed for user ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves the profile info of the user's Gmail box.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getProfile = async (userId) => {
  return executeGmailCall(userId, async (gmail) => {
    const res = await gmail.users.getProfile({ userId: "me" });
    console.log(`[GMAIL] Profile Loaded for user ${userId}`);
    return {
      emailAddress: res.data.emailAddress,
      messagesTotal: res.data.messagesTotal,
      threadsTotal: res.data.threadsTotal,
      historyId: res.data.historyId
    };
  });
};

/**
 * Prioritizes search results:
 * Tier 1: Sender match (newest first)
 * Tier 2: Subject match (newest first)
 * Tier 3: Body match (newest first)
 * @param {Array<object>} messages
 * @param {string} query
 * @returns {Array<object>}
 */
const sortMessages = (messages, query) => {
  if (!query || !Array.isArray(messages) || messages.length === 0) return messages;

  const q = query.toLowerCase().trim();

  const getCategoryScore = (msg) => {
    const sender = (msg.sender || "").toLowerCase();
    const subject = (msg.subject || "").toLowerCase();

    if (sender.includes(q)) {
      return 1; // Tier 1: Sender Match
    } else if (subject.includes(q)) {
      return 2; // Tier 2: Subject Match
    } else {
      return 3; // Tier 3: Body/Snippet Match
    }
  };

  return [...messages].sort((a, b) => {
    const catA = getCategoryScore(a);
    const catB = getCategoryScore(b);

    if (catA !== catB) {
      return catA - catB; // Lower tier score goes first
    }

    // Sort by Date (newest first)
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });
};

/**
 * Retrieves latest messages with pagination and optional query search constraints.
 * @param {string} userId
 * @param {object} options
 * @returns {Promise<object>}
 */
const getMessages = async (userId, options = {}) => {
  const { q = "", pageToken = null, maxResults = 25 } = options;
  
  if (q) {
    console.log(`[GMAIL] Search Executed: query="${q}"`);
  }
  
  return executeGmailCall(userId, async (gmail) => {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      pageToken,
      q // Pass raw search query directly to Gmail API
    });

    const messages = listRes.data.messages || [];
    const nextPageToken = listRes.data.nextPageToken || null;

    // Resolve detailed metadata for each message in parallel
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["From", "To", "Cc", "Bcc", "Reply-To", "Subject", "Date"]
          });
          const metadata = gmailFormatter.formatMessageMetadata(detail.data);
          console.log(`[GMAIL] Formatter Complete for message ID: ${msg.id}`);
          return metadata;
        } catch (err) {
          console.error(`[GMAIL_ERROR] Failed to fetch metadata for message ${msg.id}: ${err.message}`);
          return null;
        }
      })
    );

    const cleanMessages = detailedMessages.filter((m) => m !== null);
    
    // Sort and prioritize search results
    const sortedMessages = sortMessages(cleanMessages, q);
    console.log(`[GMAIL] Messages Retrieved and Sorted for user ${userId} (Count: ${sortedMessages.length})`);
    
    return {
      messages: sortedMessages,
      nextPageToken
    };
  });
};

/**
 * Retrieves a single email message with its full payload.
 * @param {string} userId
 * @param {string} id
 * @returns {Promise<object>}
 */
const getMessageDetail = async (userId, id) => {
  return executeGmailCall(userId, async (gmail) => {
    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full"
    });
    
    const formatted = gmailFormatter.formatMessage(res.data);
    console.log(`[GMAIL] Formatter Complete for details of message ID: ${id}`);
    console.log(`[GMAIL] Message Opened: ID=${id} for user ${userId}`);
    return formatted;
  });
};

/**
 * Retrieves a raw attachment from a message.
 * @param {string} userId
 * @param {string} messageId
 * @param {string} attachmentId
 * @returns {Promise<object>}
 */
const getAttachment = async (userId, messageId, attachmentId) => {
  return executeGmailCall(userId, async (gmail) => {
    const res = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId
    });
    console.log(`[GMAIL] Attachment fetched successfully. MessageId=${messageId}, AttachmentId=${attachmentId}`);
    return res.data;
  });
};

module.exports = {
  getProfile,
  getMessages,
  getMessageDetail,
  getAttachment
};
