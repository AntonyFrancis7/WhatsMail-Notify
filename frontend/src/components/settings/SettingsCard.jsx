export default function SettingsCard({ title, subtitle, children, actions }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
