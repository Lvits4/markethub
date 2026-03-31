type CategoryPillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-[var(--color-forest)] text-white shadow-sm dark:bg-emerald-600'
          : 'bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200/80 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  );
}
