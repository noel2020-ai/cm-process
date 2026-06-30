type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder: string;
  loading?: boolean;
};

export function SearchBar({ value, onChange, onSearch, placeholder, loading }: Props) {
  return (
    <div className="flex gap-3">
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button
        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        onClick={onSearch}
        type="button"
      >
        {loading ? "Loading..." : "Search"}
      </button>
    </div>
  );
}

