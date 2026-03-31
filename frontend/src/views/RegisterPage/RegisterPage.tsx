import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useRegister } from '../../hooks/useRegister';
import { registerSchema } from '../../validations/registerSchema';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      email,
      password,
      firstName,
      lastName,
      role,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(flat)) {
        if (v?.[0]) next[k] = v[0];
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    registerMutation.mutate(parsed.data, {
      onSuccess: () => {
        toast.success('Cuenta creada');
        navigate(routePaths.catalog, { replace: true });
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, 'No se pudo registrar')),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Crear cuenta
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Únete a MarketHub como cliente o vendedor.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Nombre
            </label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            {fieldErrors.firstName ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Apellido
            </label>
            <input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            {fieldErrors.lastName ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
            ) : null}
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
          >
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-zinc-600 dark:text-zinc-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          ) : null}
        </div>
        <div>
          <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Rol
          </span>
          <div className="mt-2 flex gap-3">
            <label className="flex items-center gap-2 text-sm dark:text-zinc-200">
              <input
                type="radio"
                name="role"
                checked={role === 'CUSTOMER'}
                onChange={() => setRole('CUSTOMER')}
              />
              Cliente
            </label>
            <label className="flex items-center gap-2 text-sm dark:text-zinc-200">
              <input
                type="radio"
                name="role"
                checked={role === 'SELLER'}
                onChange={() => setRole('SELLER')}
              />
              Vendedor
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center py-3.5"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creando…' : 'Registrarme'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          to={routePaths.login}
          className="font-semibold text-[var(--color-forest)] dark:text-emerald-400"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
