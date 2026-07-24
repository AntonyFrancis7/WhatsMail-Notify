import { Link } from "react-router-dom";

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

export default function EmailCard({ email }) {
  if (!email) return null;

  // Format date representation
  const formatEmailDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  return (
    <Link
      to={`/inbox/${email.id}`}
      className={`block p-5 rounded-xl border transition-all duration-300 relative group cursor-pointer overflow-hidden min-w-0 ${
        email.unread
          ? "bg-neutral-900/80 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-neutral-900 shadow-md shadow-emerald-500/2"
          : "bg-neutral-950/20 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/40"
      }`}
    >
      {/* Left indicator line for unread status */}
      {email.unread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-xl" />
      )}

      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-4">
          {/* Sender */}
          <span
            className={`text-sm truncate max-w-[70%] ${
              email.unread ? "font-bold text-neutral-100" : "font-semibold text-neutral-300"
            }`}
          >
            {email.sender || "Unknown Sender"}
          </span>

          {/* Date / Time */}
          <span className="text-xs text-neutral-500 font-mono flex-shrink-0">
            {formatEmailDate(email.date)}
          </span>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2 min-w-0">
          {email.unread && (
            <span className="flex-shrink-0 inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" title="Unread" />
          )}
          <h3
            className={`text-sm truncate ${
              email.unread ? "font-bold text-emerald-400" : "font-medium text-neutral-200"
            }`}
          >
            {email.subject}
          </h3>
        </div>

        {/* Snippet */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
          {email.snippet || "No preview available."}
        </p>

        {/* Labels display if any */}
        {email.labels && email.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {email.labels
              .filter(label => label !== "INBOX" && label !== "SENT" && label !== "DRAFT")
              .slice(0, 4)
              .map((label, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${getLabelBadgeStyle(label)}`}
                >
                  {label.replace("CATEGORY_", "")}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
