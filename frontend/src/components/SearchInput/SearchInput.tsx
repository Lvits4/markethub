import { FiSearch } from 'react-icons/fi';

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar productos…',
  className = '',
}: SearchInputProps) {
  return (
    <div
      className={`relative flex items-center rounded-md bg-white px-4 py-3.5 shadow-market ring-1 ring-zinc-200/70 dark:bg-night-900 dark:shadow-market-dark dark:ring-night-800 ${className}`}
    >
      <FiSearch className="mr-2 h-5 w-5 text-zinc-400" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-hidden dark:text-zinc-100"
        aria-label={placeholder}
      />
    </div>
  );
}
