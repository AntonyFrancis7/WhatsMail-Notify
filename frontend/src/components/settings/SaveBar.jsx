export default function SaveBar({ onSave, onCancel, hasChanges, saving, disabled }) {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-950/90 border border-neutral-800 px-6 py-4 rounded-2xl flex items-center justify-between gap-6 shadow-2xl backdrop-blur-md w-[90%] max-w-xl animate-bounce-subtle">
      <div className="text-xs font-semibold text-neutral-200">
        You have unsaved changes
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          disabled={disabled || saving}
          className="text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={disabled || saving}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {saving && (
            <svg className="animate-spin h-3.5 w-3.5 text-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
