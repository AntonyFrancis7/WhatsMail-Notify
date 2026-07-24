import { useState, useEffect } from "react";
import authService from "../services/authService";
import preferenceService from "../services/preferenceService";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/settings/LoadingOverlay";
import SaveBar from "../components/settings/SaveBar";
import CategoryCard from "../components/settings/CategoryCard";
import TrustedSenderManager from "../components/settings/TrustedSenderManager";
import BlockedSenderManager from "../components/settings/BlockedSenderManager";
import KeywordManager from "../components/settings/KeywordManager";

export default function Settings() {
  const [user, setUser] = useState(null);
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Preference lists states
  const [preferences, setPreferences] = useState([]);
  const [originalPreferences, setOriginalPreferences] = useState([]);
  const [trustedSenders, setTrustedSenders] = useState([]);
  const [blockedSenders, setBlockedSenders] = useState([]);
  const [keywords, setKeywords] = useState([]);

  // Toast trigger utility
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch User and Preferences
        const [userRes, prefRes] = await Promise.all([
          authService.getProfile(),
          preferenceService.getPreferences()
        ]);

        setUser(userRes.data);

        const { preferences: prefs, trustedSenders: trusted, blockedSenders: blocked, customKeywords: kw } = prefRes.data;
        setPreferences(prefs || []);
        setOriginalPreferences(prefs || []);
        setTrustedSenders(trusted || []);
        setBlockedSenders(blocked || []);
        setKeywords(kw || []);
      } catch (err) {
        console.error("Failed to load settings data:", err);
        setError("Failed to retrieve configuration settings. Please try again.");
        showToast("Error loading preferences.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Check if categories have dirty modifications
  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);

  // Handle local row modifications
  const handlePreferenceChange = (category, updatedRow) => {
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.category.toUpperCase() === category.toUpperCase());
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = updatedRow;
        return copy;
      }
      return [...prev, updatedRow];
    });
  };

  // PUT: Save categories preferences
  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const res = await preferenceService.updatePreferences(preferences);
      const updatedPrefs = res.data;
      setPreferences(updatedPrefs || []);
      setOriginalPreferences(updatedPrefs || []);
      showToast("Preferences Saved");
    } catch (err) {
      console.error("Save preferences failed:", err);
      showToast("Failed to save preferences settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Discard category modifications
  const handleDiscardChanges = () => {
    setPreferences(originalPreferences);
    showToast("Changes Discarded");
  };

  // GET: Default category settings template
  const handleRestoreDefaults = async () => {
    try {
      setLoading(true);
      const res = await preferenceService.getDefaultPreferences();
      // Update local state without saving
      const defaultPrefs = res.data.map(p => ({
        ...p,
        id: undefined // Remove database identifiers to match default structure
      }));
      setPreferences(defaultPrefs);
      showToast("Defaults Loaded");
    } catch (err) {
      console.error("Restore defaults failed:", err);
      showToast("Failed to retrieve default settings templates.", "error");
    } finally {
      setLoading(false);
    }
  };

  // POST: Add trusted email/domain
  const handleAddTrustedSender = async (email, domain) => {
    const res = await preferenceService.addTrustedSender(email, domain);
    setTrustedSenders((prev) => [...prev, res.data]);
    showToast("Trusted Sender Added");
  };

  // DELETE: Remove trusted email/domain
  const handleDeleteTrustedSender = async (id) => {
    try {
      await preferenceService.deleteTrustedSender(id);
      setTrustedSenders((prev) => prev.filter((s) => s.id !== id));
      showToast("Trusted Sender Removed");
    } catch (err) {
      console.error("Delete trusted failed:", err);
      showToast("Failed to delete whitelisted sender.", "error");
    }
  };

  // POST: Add blocked email/domain
  const handleAddBlockedSender = async (email, domain) => {
    const res = await preferenceService.addBlockedSender(email, domain);
    setBlockedSenders((prev) => [...prev, res.data]);
    showToast("Blocked Sender Added");
  };

  // DELETE: Remove blocked email/domain
  const handleDeleteBlockedSender = async (id) => {
    try {
      await preferenceService.deleteBlockedSender(id);
      setBlockedSenders((prev) => prev.filter((s) => s.id !== id));
      showToast("Blocked Sender Removed");
    } catch (err) {
      console.error("Delete blocked failed:", err);
      showToast("Failed to delete blacklisted sender.", "error");
    }
  };

  // POST: Add custom keyword
  const handleAddKeyword = async (keyword) => {
    const res = await preferenceService.addCustomKeyword(keyword);
    setKeywords((prev) => [...prev, res.data]);
    showToast("Keyword Added");
  };

  // DELETE: Remove custom keyword
  const handleDeleteKeyword = async (id) => {
    try {
      await preferenceService.deleteCustomKeyword(id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      showToast("Keyword Deleted");
    } catch (err) {
      console.error("Delete keyword failed:", err);
      showToast("Failed to delete keyword rule.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Navbar user={user} onLogout={() => setUser(null)} />

      {/* Floating Save changes bar */}
      <SaveBar
        hasChanges={hasChanges}
        saving={saving}
        disabled={loading}
        onSave={handleSavePreferences}
        onCancel={handleDiscardChanges}
      />

      {/* Toast Notifications Overlay */}
      <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in text-xs font-semibold ${
              toast.type === "error"
                ? "border-rose-500/25 bg-neutral-900/90 text-rose-450"
                : "border-emerald-500/25 bg-neutral-900/90 text-emerald-400"
            }`}
          >
            <span>{toast.type === "error" ? "❌" : "✓"}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 leading-tight">
            Notification Settings
          </h1>
          <p className="text-xs text-neutral-450 mt-1">
            Configure categorizations, whitelist trusted contacts, filter blocked senders, and declare custom alert keywords.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-450 text-sm">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <LoadingOverlay />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Left/Middle area: Category manager (spans 2 columns on desktop) */}
            <div className="lg:col-span-2">
              <CategoryCard
                preferences={preferences}
                onPreferenceChange={handlePreferenceChange}
                onSave={handleSavePreferences}
                onRestoreDefaults={handleRestoreDefaults}
                loading={loading}
                saving={saving}
              />
            </div>

            {/* Right area: Lists managers */}
            <div className="space-y-6 lg:col-span-1">
              <TrustedSenderManager
                senders={trustedSenders}
                onAdd={handleAddTrustedSender}
                onDelete={handleDeleteTrustedSender}
                loading={loading}
              />

              <BlockedSenderManager
                senders={blockedSenders}
                onAdd={handleAddBlockedSender}
                onDelete={handleDeleteBlockedSender}
                loading={loading}
              />

              <KeywordManager
                keywords={keywords}
                onAdd={handleAddKeyword}
                onDelete={handleDeleteKeyword}
                loading={loading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
