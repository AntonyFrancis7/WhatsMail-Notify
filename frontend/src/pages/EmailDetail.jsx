import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import authService from "../services/authService";
import gmailService from "../services/gmailService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Returns Tailwind css classes for Gmail labels.
 * @param {string} label
 * @returns {string} Tailwind classes
 */
const getLabelBadgeStyle = (label) => {
  switch (label.toUpperCase()) {
    case "UNREAD":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    case "IMPORTANT":
      return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    case "STARRED":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
    case "INBOX":
      return "bg-sky-500/10 text-sky-400 border-sky-500/25";
    case "CATEGORY_PERSONAL":
      return "bg-slate-500/10 text-slate-400 border-slate-500/25";
    case "CATEGORY_UPDATES":
      return "bg-purple-500/10 text-purple-400 border-purple-500/25";
    case "CATEGORY_SOCIAL":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
    case "CATEGORY_PROMOTIONS":
      return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    case "CATEGORY_FORUMS":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/25";
    case "SENT":
      return "bg-teal-500/10 text-teal-400 border-teal-500/25";
    case "DRAFT":
      return "bg-gray-500/10 text-gray-400 border-gray-500/25";
    default:
      return "bg-neutral-800 text-neutral-400 border-neutral-700/50";
  }
};

export default function EmailDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load logged-in user profile
        const userRes = await authService.getProfile();
        setUser(userRes.data);

        // Load single email detailed details
        const emailRes = await gmailService.getMessageDetail(id);
        setEmail(emailRes.data);
      } catch (err) {
        console.error("Failed to load email details", err);
        setError(err.response?.data?.message || "Failed to load email details from Gmail API.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  // Adjust iframe bounds dynamically when content loads
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc && doc.body) {
          iframe.style.height = `${doc.body.scrollHeight + 40}px`;
        }
      }
    } catch (e) {
      console.warn("Could not auto-adjust iframe height due to origin sandbox restriction.", e);
    }
  };

  // Re-adjust height in case external assets like images resolve late
  useEffect(() => {
    if (email && !loading) {
      const timer = setTimeout(handleIframeLoad, 500);
      return () => clearTimeout(timer);
    }
  }, [email, loading]);

  // Format file size representation
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDetailDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString([], {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  // Construct secure HTML srcDoc content for iframe
  const getIframeSrcDoc = () => {
    if (!email || !email.body) return "";
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              font-size: 15px;
              line-height: 1.6;
              color: #e5e5e5;
              background-color: transparent;
              margin: 0;
              padding: 16px;
              word-break: break-word;
            }
            /* Styling scrollbars inside iframe */
            ::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #525252;
            }
            a {
              color: #10b981;
              text-decoration: underline;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
              border-radius: 8px;
            }
            table {
              max-width: 100% !important;
              width: 100% !important;
              height: auto !important;
            }
            blockquote {
              border-left: 3.5px solid #525252;
              margin-left: 0;
              padding-left: 12px;
              color: #a3a3a3;
            }
            pre {
              background-color: #1e1e1e;
              padding: 10px;
              border-radius: 6px;
              overflow-x: auto;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          ${email.body}
        </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <Navbar user={user} onLogout={() => setUser(null)} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Back navigation */}
        <div>
          <Link
            to="/inbox"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Inbox
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-400 text-sm">
            <p className="font-semibold">Failed to load message</p>
            <p className="text-xs text-rose-400/85 mt-1">{error}</p>
          </div>
        )}

        {/* Message Container */}
        {email && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md shadow-xl overflow-hidden">
            
            {/* Header Details */}
            <div className="p-6 border-b border-neutral-800 space-y-4">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 leading-tight">
                  {email.subject}
                </h1>
                <div className="flex flex-wrap gap-1.5">
                  {email.labels && email.labels.map((label, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${getLabelBadgeStyle(label)}`}
                    >
                      {label.replace("CATEGORY_", "")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-neutral-400 pt-2 border-t border-neutral-900">
                <div className="space-y-1.5">
                  <p>
                    <span className="font-medium text-neutral-500">From:</span>{" "}
                    <span className="text-neutral-200 font-semibold">{email.sender}</span>
                  </p>
                  {email.recipient && (
                    <p>
                      <span className="font-medium text-neutral-500">To:</span>{" "}
                      <span className="text-neutral-300">{email.recipient}</span>
                    </p>
                  )}
                  {email.cc && (
                    <p>
                      <span className="font-medium text-neutral-500">Cc:</span>{" "}
                      <span className="text-neutral-300 text-xs">{email.cc}</span>
                    </p>
                  )}
                  {email.replyTo && (
                    <p>
                      <span className="font-medium text-neutral-500">Reply-To:</span>{" "}
                      <span className="text-neutral-300 text-xs">{email.replyTo}</span>
                    </p>
                  )}
                </div>
                <div className="text-xs font-mono text-neutral-500 sm:text-right">
                  {formatDetailDate(email.date)}
                </div>
              </div>
            </div>

            {/* Email Message Content Body */}
            <div className="p-2 sm:p-6 bg-neutral-950/20">
              {email.body ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={getIframeSrcDoc()}
                  title="email-body"
                  onLoad={handleIframeLoad}
                  // Strict sandbox: allow-popups lets click links, but NO scripts are executed!
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                  className="w-full border-0 min-h-[350px] transition-all bg-transparent"
                />
              ) : (
                <p className="text-sm italic text-neutral-500 text-center py-10">
                  (Empty message body)
                </p>
              )}
            </div>

            {/* Attachments Section */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachments ({email.attachments.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {email.attachments.map((file, idx) => {
                    const downloadUrl = `${API_URL}/api/gmail/messages/${id}/attachments/${file.id}?filename=${encodeURIComponent(file.filename)}&mimeType=${encodeURIComponent(file.mimeType)}`;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center gap-3 truncate max-w-[70%]">
                          {/* File Icon */}
                          <div className="p-2 rounded-lg bg-neutral-800 text-emerald-400 flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          <div className="truncate space-y-0.5">
                            <p className="font-semibold text-neutral-200 truncate" title={file.filename}>
                              {file.filename}
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>

                        {/* Download link button */}
                        <a
                          href={downloadUrl}
                          download={file.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 transition cursor-pointer"
                        >
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
