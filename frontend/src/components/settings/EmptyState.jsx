export default function EmptyState({ message }) {
  return (
    <div className="w-full text-center py-10 border border-dashed border-neutral-800/80 rounded-2xl bg-neutral-900/5">
      <svg className="mx-auto h-6 w-6 text-neutral-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5m12 3.5l-2-2m-3-3l-2-2m0 0l-2-2" />
      </svg>
      <p className="text-xs text-neutral-500 font-semibold">{message}</p>
    </div>
  );
}
