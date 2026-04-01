import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthPasswordField } from '../../components/AuthPasswordField/AuthPasswordField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { resetPasswordRequest } from '../../requests/authRequests';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') ?? '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Falta el token de recuperación');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPending(true);
    try {
      await resetPasswordRequest(token.trim(), password);
      toast.success('Contraseña actualizada');
      navigate(routePaths.login, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 dark:text-zinc-50">
        Nueva contraseña
      </h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-zinc-500 dark:text-zinc-400">
        Usa el token devuelto por “Olvidé mi contraseña”, no tu token de sesión JWT.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-3">
        <div>
          <label
            htmlFor="token"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
          >
            Token
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none dark:border-night-600 dark:bg-night-950/80 dark:text-zinc-100"
            placeholder="Pega el token aquí"
          />
        </div>
        <AuthPasswordField
          id="new-password"
          label="Nueva contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full cursor-pointer rounded-md bg-auth-primary py-3 text-sm font-semibold text-white shadow-md transition hover:bg-auth-primary-hover disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link to={routePaths.login} className="font-semibold text-auth-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
