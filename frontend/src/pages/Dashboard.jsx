export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-neutral-400">Monitor active mail checks and WhatsApp alerting logs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40">
          <h3 className="text-sm font-medium text-neutral-400">Alert Rules Active</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-400">0</p>
        </div>
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40">
          <h3 className="text-sm font-medium text-neutral-400">Gmail Watch Status</h3>
          <p className="text-3xl font-bold mt-2 text-rose-500">Disconnected</p>
        </div>
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/40">
          <h3 className="text-sm font-medium text-neutral-400">Notifications Sent</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Active Alert Rules</h2>
        <div className="border border-dashed border-neutral-800 rounded-lg p-8 text-center text-neutral-500 text-sm">
          No alert rules defined. Run authentication setup to select your senders.
        </div>
      </div>
    </div>
  );
}
