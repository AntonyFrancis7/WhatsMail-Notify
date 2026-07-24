export default function PriorityDropdown({ value, onChange, disabled }) {
  const options = ["LOW", "MEDIUM", "HIGH"];

  return (
    <div className="relative">
      <select
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none block w-full px-3 py-1.5 pr-8 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white focus:outline-none focus:border-emerald-500/50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-neutral-950 text-neutral-300">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
