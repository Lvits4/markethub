import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminUpdateUser } from '../../hooks/useAdminUpdateUser';
import type { AdminUserRow } from '../../types/admin';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const ROLES = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'SELLER', label: 'Vendedor' },
  { value: 'ADMIN', label: 'Administrador' },
] as const;

function isValidEmail(v: string): boolean {
  const t = v.trim();
  if (!t) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export type AdminEditUserFormProps = {
  user: AdminUserRow;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminEditUserForm({
  user,
  onSuccess,
  onCancel,
}: AdminEditUserFormProps) {
  const updateMut = useAdminUpdateUser();
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setEmail(user.email);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setRole(user.role);
    setIsActive(user.isActive);
    setPassword('');
  }, [user]);

  const busy = updateMut.isPending;

  const handleSubmit = () => {
    const em = email.trim();
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!isValidEmail(em)) {
      toast.error('Introduce un correo válido');
      return;
    }
    if (!fn || !ln) {
      toast.error('Nombre y apellidos son obligatorios');
      return;
    }
    const pwd = password.trim();
    if (pwd && pwd.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    const body: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      password?: string;
    } = {
      email: em,
      firstName: fn,
      lastName: ln,
      role,
      isActive,
    };
    if (pwd) body.password = pwd;

    updateMut.mutate(
      { userId: user.id, body },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado');
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ID: <span className="font-mono">{user.id}</span>
          </p>
          <div>
            <label htmlFor="edit-user-email" className={labelClass}>
              Correo <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="edit-user-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              disabled={busy}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-user-first" className={labelClass}>
                Nombre <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="edit-user-first"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
                disabled={busy}
              />
            </div>
            <div>
              <label htmlFor="edit-user-last" className={labelClass}>
                Apellidos <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="edit-user-last"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-user-role" className={labelClass}>
              Rol <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <select
              id="edit-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={fieldClass}
              disabled={busy}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-user-password" className={labelClass}>
              Nueva contraseña
            </label>
            <input
              id="edit-user-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar vacío para no cambiar"
              className={fieldClass}
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
      <div className="flex w-full shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex w-full gap-2 sm:w-auto">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={onCancel}
              className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:min-w-[7.5rem]"
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="button"
            variant="cta"
            disabled={busy}
            onClick={handleSubmit}
            className="h-11 min-h-11 min-w-0 flex-1 justify-center px-3 sm:min-w-[11rem]"
          >
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </form>
  );
}
