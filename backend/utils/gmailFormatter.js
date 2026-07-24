/**
 * Helper to retrieve a header value by name case-insensitively.
 * @param {Array<{name: string, value: string}>} headers
 * @param {string} name
 * @returns {string}
 */
const getHeader = (headers, name) => {
  if (!headers || !Array.isArray(headers)) return "";
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : "";
};

/**
 * Recursively parses MIME parts to extract the body content.
 * Prefers HTML body over plain text.
 * @param {object} payload
 * @returns {string}
 */
const extractBody = (payload) => {
  if (!payload) return "";
  
  let bodyHtml = "";
  let bodyText = "";

  const parsePart = (part) => {
    if (!part) return;
    
    const mimeType = part.mimeType ? part.mimeType.toLowerCase() : "";
    const bodyData = part.body ? part.body.data : null;

    if (bodyData && mimeType) {
      try {
        // Correctly decode base64url formatted data
        const decoded = Buffer.from(bodyData, "base64url").toString("utf8");
        if (mimeType === "text/html") {
          bodyHtml = decoded;
        } else if (mimeType === "text/plain" && !bodyText) {
          bodyText = decoded;
        }
      } catch (err) {
        console.error(`[FORMATTER_ERROR] Failed to decode mime body part: ${err.message}`);
      }
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(parsePart);
    }
  };

  if (payload.parts && Array.isArray(payload.parts)) {
    payload.parts.forEach(parsePart);
  } else if (payload.body && payload.body.data) {
    const mimeType = payload.mimeType ? payload.mimeType.toLowerCase() : "";
    try {
      const decoded = Buffer.from(payload.body.data, "base64url").toString("utf8");
      if (mimeType === "text/html") {
        bodyHtml = decoded;
      } else {
        bodyText = decoded;
      }
    } catch (err) {
      console.error(`[FORMATTER_ERROR] Failed to decode root payload body: ${err.message}`);
    }
  }

  // Final check: return formatted string, fall back to plain text if HTML isn't resolved
  return bodyHtml || bodyText || "";
};

/**
 * Recursively parses MIME parts to extract list of attachments.
 * @param {object} payload
 * @returns {Array<object>}
 */
const extractAttachments = (payload) => {
  if (!payload) return [];
  
  const attachments = [];

  const findAttachments = (part) => {
    if (!part) return;
    
    if (part.filename && part.body && part.body.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body.size || 0
      });
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(findAttachments);
    }
  };

  if (payload.parts && Array.isArray(payload.parts)) {
    payload.parts.forEach(findAttachments);
  }

  return attachments;
};

/**
 * Formats a raw Gmail message response into clean JSON.
 * @param {object} msg
 * @returns {object|null}
 */
const formatMessage = (msg) => {
  if (!msg) return null;

  const headers = msg.payload ? msg.payload.headers : [];
  const sender = getHeader(headers, "From");
  const recipient = getHeader(headers, "To");
  const cc = getHeader(headers, "Cc");
  const bcc = getHeader(headers, "Bcc");
  const replyTo = getHeader(headers, "Reply-To");
  const subject = getHeader(headers, "Subject") || "(No Subject)";
  const dateStr = getHeader(headers, "Date");
  const date = dateStr ? new Date(dateStr) : new Date(parseInt(msg.internalDate || Date.now()));

  const body = extractBody(msg.payload || {});
  const attachments = extractAttachments(msg.payload || {});

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || "",
    sender,
    recipient,
    cc,
    bcc,
    replyTo,
    subject,
    date: date.toISOString(),
    labels: msg.labelIds || [],
    unread: msg.labelIds ? msg.labelIds.includes("UNREAD") : false,
    body,
    attachments
  };
};

/**
 * Lightweight formatting of metadata for message list views.
 * @param {object} msg
 * @returns {object|null}
 */
const formatMessageMetadata = (msg) => {
  if (!msg) return null;

  const headers = msg.payload ? msg.payload.headers : [];
  const sender = getHeader(headers, "From");
  const recipient = getHeader(headers, "To");
  const cc = getHeader(headers, "Cc");
  const bcc = getHeader(headers, "Bcc");
  const replyTo = getHeader(headers, "Reply-To");
  const subject = getHeader(headers, "Subject") || "(No Subject)";
  const dateStr = getHeader(headers, "Date");
  const date = dateStr ? new Date(dateStr) : new Date(parseInt(msg.internalDate || Date.now()));

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || "",
    sender,
    recipient,
    cc,
    bcc,
    replyTo,
    subject,
    date: date.toISOString(),
    labels: msg.labelIds || [],
    unread: msg.labelIds ? msg.labelIds.includes("UNREAD") : false
  };
};

module.exports = {
  formatMessage,
  formatMessageMetadata
};
