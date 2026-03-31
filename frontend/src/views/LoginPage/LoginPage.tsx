import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthPasswordField } from '../../components/AuthPasswordField/AuthPasswordField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useLogin } from '../../hooks/useLogin';
import { loginSchema } from '../../validations/loginSchema';

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/18 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-950';

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
      onSuccess: (data) => {
        toast.success('Bienvenido');
        if (data.user.role === 'ADMIN') {
          navigate(routePaths.admin, { replace: true });
          return;
        }
        navigate(from, { replace: true });
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, 'Error al iniciar sesión')),
    });
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 dark:text-zinc-50">
        Iniciar sesión
      </h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-zinc-500 dark:text-zinc-400">
        Accede a tu carrito, favoritos y pedidos.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <div>
          <label
            htmlFor="email"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
          >
            Correo electrónico
          </label>
          <input
            id="email"
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
        </div>
        <AuthPasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="current-password"
          placeholder="Tu contraseña"
        />

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-3 w-full cursor-pointer rounded-xl bg-auth-primary py-3 text-sm font-semibold text-white shadow-md shadow-auth-primary/35 transition hover:bg-auth-primary-hover hover:shadow-lg hover:shadow-auth-primary/30 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"
        >
          {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿No tienes cuenta?{' '}
        <Link
          to={routePaths.register}
          className="font-semibold text-auth-primary hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
