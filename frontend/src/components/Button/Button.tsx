import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'icon';

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
      'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-md px-5 py-3 shadow-sm hover:bg-zinc-800 dark:hover:bg-white',
    ghost:
      'rounded-md px-4 py-2 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800',
    icon: 'rounded-md p-2.5 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800',
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
