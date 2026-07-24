import { useState } from "react";
import SettingsCard from "./SettingsCard";
import EmptyState from "./EmptyState";

export default function KeywordManager({ keywords, onAdd, onDelete, loading }) {
  const [newKeyword, setNewKeyword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = newKeyword.trim().toLowerCase();
    if (!value) {
      setError("Please enter a valid keyword.");
      return;
    }

    if (value.length > 50) {
      setError("Keyword is too long (maximum 50 characters).");
      return;
    }

    // Duplicate check
    const isDuplicate = keywords.some(
      (k) => k.keyword.toLowerCase() === value
    );

    if (isDuplicate) {
      setError("This keyword is already in the list.");
      return;
    }

    try {
      setSubmitting(true);
      await onAdd(newKeyword.trim());
      setNewKeyword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add keyword.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsCard
      title="Custom Keywords"
      subtitle="Define custom words. Emails matching these words will always trigger WhatsApp alerts."
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Offer Letter, Interview, Salary, Urgent"
              value={newKeyword}
              onChange={(e) => {
                setNewKeyword(e.target.value);
                if (error) setError("");
              }}
              disabled={loading || submitting}
              className="flex-1 px-4 py-2.5 text-xs bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-emerald-500/50 text-neutral-100 placeholder-neutral-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              {submitting ? (
                <svg className="animate-spin h-3.5 w-3.5 text-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
              Add Keyword
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
        </form>

        <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
          {keywords.length === 0 ? (
            <EmptyState message="No custom keywords defined yet." />
          ) : (
            keywords.map((k) => (
              <div
                key={k.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700/60 transition group"
              >
                <span className="text-xs font-semibold text-neutral-300 font-mono">
                  {k.keyword}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(k.id)}
                  disabled={loading || submitting}
                  className="text-neutral-500 hover:text-rose-400 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Delete Keyword"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
