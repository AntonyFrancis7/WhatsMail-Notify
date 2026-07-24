import SettingsCard from "./SettingsCard";
import CategoryRow from "./CategoryRow";

const ORDERED_CATEGORIES = [
  "BANKING",
  "SECURITY",
  "OTP",
  "WORK",
  "JOB",
  "SHOPPING",
  "DELIVERY",
  "TRAVEL",
  "BILLS",
  "GOVERNMENT",
  "EDUCATION",
  "SOCIAL",
  "NEWSLETTER",
  "PROMOTIONS",
  "PERSONAL",
  "UNKNOWN"
];

export default function CategoryCard({ preferences, onPreferenceChange, onSave, onRestoreDefaults, loading, saving }) {
  // Map preferences array to a map for easy lookup
  const prefMap = (preferences || []).reduce((acc, curr) => {
    acc[curr.category.toUpperCase()] = curr;
    return acc;
  }, {});

  const handleToggle = (catName, checked) => {
    const updated = {
      ...(prefMap[catName] || { category: catName, minimumPriority: "MEDIUM" }),
      enabled: checked
    };
    onPreferenceChange(catName, updated);
  };

  const handlePriorityChange = (catName, priority) => {
    const updated = {
      ...(prefMap[catName] || { category: catName, enabled: true }),
      minimumPriority: priority
    };
    onPreferenceChange(catName, updated);
  };

  return (
    <SettingsCard
      title="Notification Categories"
      subtitle="Configure category triggers and their minimum priority threshold for WhatsApp alerts."
      actions={
        <button
          onClick={onRestoreDefaults}
          disabled={loading || saving}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Restore Defaults
        </button>
      }
    >
      <div className="space-y-3">
        {ORDERED_CATEGORIES.map((cat) => {
          const pref = prefMap[cat] || { category: cat, enabled: false, minimumPriority: "MEDIUM" };
          return (
            <CategoryRow
              key={cat}
              category={cat}
              enabled={pref.enabled}
              minimumPriority={pref.minimumPriority}
              onToggle={(checked) => handleToggle(cat, checked)}
              onPriorityChange={(priority) => handlePriorityChange(cat, priority)}
              disabled={loading || saving}
            />
          );
        })}

        <div className="pt-6 border-t border-neutral-850 flex items-center justify-end gap-3">
          <button
            onClick={onSave}
            disabled={loading || saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 transition duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}
