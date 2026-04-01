import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const fieldClass =
  'w-full rounded-md border border-zinc-200/90 bg-zinc-50/80 py-3 pl-4 pr-11 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/18 dark:border-night-600 dark:bg-night-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-night-950';

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
};

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete = 'current-password',
  placeholder,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-night-800 dark:hover:text-zinc-200"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? (
            <FiEyeOff className="h-[18px] w-[18px]" aria-hidden />
          ) : (
            <FiEye className="h-[18px] w-[18px]" aria-hidden />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
