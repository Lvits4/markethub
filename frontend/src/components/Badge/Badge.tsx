type BadgeProps = {
  label: string;
  className?: string;
};

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span
      className={`absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-warm)] shadow-sm dark:bg-zinc-900/90 dark:text-orange-300 ${className}`}
    >
      {label}
    </span>
  );
}
