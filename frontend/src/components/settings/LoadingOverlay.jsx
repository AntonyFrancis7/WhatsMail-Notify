export default function LoadingOverlay() {
  return (
    <div className="space-y-6">
      {/* Skeletons */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-neutral-850 rounded w-1/3" />
        <div className="h-3 bg-neutral-900 rounded w-1/2" />
        <div className="space-y-3 pt-4">
          <div className="h-12 bg-neutral-900/60 rounded-xl" />
          <div className="h-12 bg-neutral-900/60 rounded-xl" />
          <div className="h-12 bg-neutral-900/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
