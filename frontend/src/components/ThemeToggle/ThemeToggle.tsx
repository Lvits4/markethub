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
      className={`inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:bg-zinc-800 ${className}`}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <FiSun className="h-5 w-5" aria-hidden />
      ) : (
        <FiMoon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
