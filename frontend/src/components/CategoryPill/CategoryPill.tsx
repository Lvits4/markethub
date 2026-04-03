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
      className={`shrink-0 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-[var(--color-forest)] text-white shadow-sm dark:bg-[var(--color-market-dark-surface)] dark:text-[var(--color-market-dark-accent)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:hover:bg-[var(--color-market-dark-surface-hover)]'
          : 'bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200/80 hover:bg-zinc-50 dark:bg-night-900 dark:text-zinc-200 dark:ring-night-800 dark:hover:bg-night-800'
      }`}
    >
      {label}
    </button>
  );
}
