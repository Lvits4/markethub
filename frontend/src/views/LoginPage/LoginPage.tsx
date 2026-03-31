import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useLogin } from '../../hooks/useLogin';
import { loginSchema } from '../../validations/loginSchema';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? routePaths.catalog;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      return;
    }
    setFieldErrors({});
    loginMutation.mutate(parsed.data, {
      onSuccess: () => {
        toast.success('Bienvenido');
        navigate(from, { replace: true });
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, 'Error al iniciar sesión')),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Accede a tu carrito y favoritos.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center py-3.5"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿No tienes cuenta?{' '}
        <Link
          to={routePaths.register}
          className="font-semibold text-[var(--color-forest)] dark:text-emerald-400"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
