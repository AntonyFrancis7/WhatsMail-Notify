import { useState } from "react";
import SettingsCard from "./SettingsCard";
import EmptyState from "./EmptyState";

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateDomain = (domain) => {
  const re = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return re.test(String(domain).toLowerCase());
};

export default function BlockedSenderManager({ senders, onAdd, onDelete, loading }) {
  const [newSender, setNewSender] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = newSender.trim();
    if (!value) {
      setError("Please enter a valid email or domain.");
      return;
    }

    if (value.length > 100) {
      setError("Value is too long (maximum 100 characters).");
      return;
    }

    // Determine format
    const isEmail = value.includes("@");
    if (isEmail) {
      if (!validateEmail(value)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      if (!validateDomain(value)) {
        setError("Please enter a valid domain name (e.g. cheap-loans.com).");
        return;
      }
    }

    // Duplicate check
    const isDuplicate = senders.some((s) => {
      const matchEmail = s.email && s.email.toLowerCase() === value.toLowerCase();
      const matchDomain = s.domain && s.domain.toLowerCase() === value.toLowerCase();
      return matchEmail || matchDomain;
    });

    if (isDuplicate) {
      setError("This sender or domain is already blocked.");
      return;
    }

    try {
      setSubmitting(true);
      await onAdd(isEmail ? value : null, isEmail ? null : value);
      setNewSender("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add blocked sender.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsCard
      title="Blocked Senders"
      subtitle="Emails or domains blacklisted to always prevent alerts and silence notifications."
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. spam@gmail.com or cheap-loans.com"
              value={newSender}
              onChange={(e) => {
                setNewSender(e.target.value);
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
              Block Sender
            </button>
          </div>
          {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {senders.length === 0 ? (
            <EmptyState message="No blocked senders blacklisted yet." />
          ) : (
            senders.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/30 border border-neutral-800/60 hover:border-neutral-700/60 transition duration-300 gap-4"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 flex-shrink-0">
                    {s.email ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-neutral-300 truncate font-mono">
                    {s.email || s.domain}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  disabled={loading || submitting}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
