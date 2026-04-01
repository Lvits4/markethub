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
      'rounded-md bg-[var(--color-admin-primary)] px-5 py-3 text-white shadow-sm hover:bg-[var(--color-admin-primary-hover)] dark:bg-blue-600 dark:hover:bg-blue-500',
    outline:
      'rounded-md border-2 border-[var(--color-admin-primary)] bg-transparent px-5 py-3 text-[var(--color-admin-primary)] hover:bg-[color-mix(in_srgb,var(--color-admin-primary)_10%,transparent)] dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10',
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
