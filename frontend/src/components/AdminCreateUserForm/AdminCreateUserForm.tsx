import { useState } from 'react';
import toast from 'react-hot-toast';
import { FormSelect } from '../CreateProductForm/FormSelect';
import { Button } from '../Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminCreateUser } from '../../hooks/useAdminCreateUser';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const ROLES = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'SELLER', label: 'Vendedor' },
  { value: 'ADMIN', label: 'Administrador' },
] as const;

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r.value, label: r.label }));

function isValidEmail(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export type AdminCreateUserFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminCreateUserForm({
  onSuccess,
  onCancel,
}: AdminCreateUserFormProps) {
  const createMut = useAdminCreateUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<string>('CUSTOMER');
  const [isActive, setIsActive] = useState(true);

  const busy = createMut.isPending;

  const handleSubmit = () => {
    const em = email.trim();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const pw = password;
    if (!isValidEmail(em)) {
      toast.error('Introduce un correo válido');
      return;
    }
    if (pw.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!fn || !ln) {
      toast.error('Nombre y apellidos son obligatorios');
      return;
    }
    createMut.mutate(
      {
        email: em,
        password: pw,
        firstName: fn,
        lastName: ln,
        role,
        isActive,
      },
      {
        onSuccess: () => {
          toast.success('Usuario creado');
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 max-h-[min(60vh,520px)] flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:max-h-[min(65vh,580px)]">
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="create-user-email" className={labelClass}>
              Correo <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="create-user-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              disabled={busy}
            />
          </div>
          <div>
            <label htmlFor="create-user-password" className={labelClass}>
              Contraseña <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="create-user-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              disabled={busy}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Mínimo 6 caracteres.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="create-user-first" className={labelClass}>
                Nombre <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="create-user-first"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
                disabled={busy}
              />
            </div>
            <div>
              <label htmlFor="create-user-last" className={labelClass}>
                Apellidos <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="create-user-last"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <label htmlFor="create-user-role" className={labelClass}>
              Rol <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <FormSelect
              id="create-user-role"
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
              disabled={busy}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={busy}
              className="rounded border-zinc-300"
            />
            Cuenta activa
          </label>
        </div>
      </div>
      <div
        className={`flex w-full shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 sm:flex-row sm:flex-wrap sm:items-center ${onCancel ? 'sm:justify-between' : 'sm:justify-end'}`}
      >
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
            className="h-11 min-h-11 w-full justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:w-auto sm:min-w-[7.5rem]"
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          variant="cta"
          disabled={busy}
          onClick={handleSubmit}
          className="h-11 min-h-11 w-full justify-center px-3 sm:min-w-[11rem] sm:w-auto"
        >
          {busy ? 'Creando…' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
