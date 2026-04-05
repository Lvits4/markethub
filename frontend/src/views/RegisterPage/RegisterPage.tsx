import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPasswordField } from '../../components/AuthPasswordField/AuthPasswordField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useRegister } from '../../hooks/useRegister';
import { registerSchema } from '../../validations/registerSchema';

const inputClass =
  'mt-1 w-full rounded-md border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-hidden transition placeholder:text-zinc-400 focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/18 dark:border-night-600 dark:bg-night-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-night-950';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
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
      onSuccess: (data) => {
        toast.success('Cuenta creada');
        if (data.user.role === 'ADMIN') {
          navigate(routePaths.admin, { replace: true });
          return;
        }
        navigate(routePaths.catalog, { replace: true });
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, 'No se pudo registrar')),
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-balance text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Crear tu cuenta
      </h1>
      <p className="mt-1 text-[15px] leading-snug text-pretty text-zinc-500 dark:text-zinc-400">
        Hola. Vamos a crear tu cuenta en MarketHub.
      </p>

      <form onSubmit={handleSubmit} className="mt-2.5 flex flex-col gap-1.5">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Nombre
          </span>
          <input
            autoComplete="name"
            placeholder="Ej. Laura García"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
          ) : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Correo electrónico
          </span>
          <input
            type="email"
            autoComplete="email"
            placeholder="nombre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          ) : null}
        </label>

        <AuthPasswordField
          label="Contraseña"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />

        <div>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            ¿Eres comprador o vendedor?
          </span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition ${
                role === 'CUSTOMER'
                  ? 'border-auth-primary bg-auth-primary/8 text-auth-primary'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-night-600 dark:text-zinc-300 dark:hover:border-zinc-500'
              }`}
            >
              Comprador
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium transition ${
                role === 'SELLER'
                  ? 'border-auth-primary bg-auth-primary/8 text-auth-primary'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-night-600 dark:text-zinc-300 dark:hover:border-zinc-500'
              }`}
            >
              Vendedor
            </button>
          </div>
          {fieldErrors.role ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.role}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2 w-full cursor-pointer rounded-md bg-auth-primary py-3 text-sm font-semibold text-white shadow-md shadow-auth-primary/35 transition hover:bg-auth-primary-hover hover:shadow-lg hover:shadow-auth-primary/30 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"
        >
          {registerMutation.isPending ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿Ya estás con nosotros?{' '}
        <Link
          to={routePaths.login}
          className="font-semibold text-auth-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
