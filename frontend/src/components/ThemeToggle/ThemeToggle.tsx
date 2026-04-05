import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`box-border inline-flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/90 transition hover:bg-zinc-50 hover:text-zinc-950 dark:bg-night-900 dark:text-zinc-100 dark:ring-night-800 dark:hover:bg-night-800 ${className}`}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <FiSun className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
      ) : (
        <FiMoon className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
      )}
    </button>
  );
}
