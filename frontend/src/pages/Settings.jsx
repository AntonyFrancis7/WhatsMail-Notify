import { useState } from 'react';

export default function Settings() {
  const [senders, setSenders] = useState([]);
  const [newSender, setNewSender] = useState('');

  const handleAddSender = (e) => {
    e.preventDefault();
    if (!newSender.trim()) return;
    setSenders([...senders, newSender.trim()]);
    setNewSender('');
  };

  const handleRemoveSender = (index) => {
    setSenders(senders.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuration Settings</h1>
        <p className="text-sm text-neutral-400">Manage your Google account status, active sender alerts, and WhatsApp webhook credentials.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left pane: Google Auth and Whatsapp config placeholders */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-4">
            <h2 className="text-lg font-semibold">1. Account Connections</h2>
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Google Account Reference</p>
                <p className="text-xs text-neutral-500">Not authenticated</p>
              </div>
              <button className="px-4 py-2 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 transition">
                Connect
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-4">
            <h2 className="text-lg font-semibold">2. WhatsApp Credentials</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">WhatsApp Webhook Target Number</label>
                <input
                  type="text"
                  placeholder="+44 7911 123456"
                  disabled
                  className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded text-neutral-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-neutral-500 italic">To configure real numbers, please define credentials in your backend environment variables config.</p>
            </div>
          </div>
        </div>

        {/* Right pane: Senders whitelist list */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">3. Sender Whitelist Alerts</h2>
            <p className="text-xs text-neutral-400">Specify email addresses to trigger WhatsApp alerts.</p>
          </div>

          <form onSubmit={handleAddSender} className="flex gap-2">
            <input
              type="email"
              placeholder="e.g. boss@company.com"
              value={newSender}
              onChange={(e) => setNewSender(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded focus:outline-none focus:border-emerald-500 text-neutral-100"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-900 transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {senders.length === 0 ? (
              <p className="text-center text-xs text-neutral-500 py-6 border border-dashed border-neutral-800 rounded-lg">
                No senders whitelisted yet.
              </p>
            ) : (
              senders.map((sender, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <span className="text-xs font-mono">{sender}</span>
                  <button
                    onClick={() => handleRemoveSender(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
