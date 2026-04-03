import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'icon' | 'cta';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none';

  const styles: Record<ButtonVariant, string> = {
    primary:
      'rounded-md bg-blue-500 px-5 py-3 text-white shadow-sm hover:bg-blue-600 dark:bg-[var(--color-market-dark-surface)] dark:text-[var(--color-market-dark-accent)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:hover:bg-[var(--color-market-dark-surface-hover)]',
    outline:
      'rounded-md border-2 border-sky-400 bg-transparent px-5 py-3 text-sky-600 hover:bg-sky-400/10 dark:border-[color:rgb(69_139_222/0.42)] dark:text-[var(--color-market-dark-accent)] dark:hover:bg-[color:rgb(21_42_94/0.55)]',
    ghost:
      'rounded-md px-4 py-2 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-night-800',
    icon:
      'rounded-md p-2.5 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-night-800',
    cta: 'admin-cta-solid rounded-md text-sm font-medium',
  };

  return (
    <button
      type="button"
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
