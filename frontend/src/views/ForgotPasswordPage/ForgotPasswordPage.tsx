import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { forgotPasswordRequest } from '../../requests/authRequests';

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-auth-primary focus:bg-white focus:ring-2 focus:ring-auth-primary/18 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:bg-zinc-950';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Indica tu correo');
      return;
    }
    setPending(true);
    setDevToken(null);
    try {
      const res = await forgotPasswordRequest(trimmed);
      toast.success(res.message);
      if (res.resetToken) {
        setDevToken(res.resetToken);
        toast('Token de desarrollo disponible abajo', { icon: '🔑' });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-balance text-zinc-900 dark:text-zinc-50">
        Recuperar contraseña
      </h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-zinc-500 dark:text-zinc-400">
        Te enviaremos instrucciones si el correo está registrado. En desarrollo el
        servidor puede devolver un token visible.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-2">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-3 w-full cursor-pointer rounded-xl bg-auth-primary py-3 text-sm font-semibold text-white shadow-md shadow-auth-primary/35 transition hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      {devToken ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Token (solo desarrollo)</p>
          <p className="mt-2 break-all font-mono">{devToken}</p>
          <Link
            to={`${routePaths.resetPassword}?token=${encodeURIComponent(devToken)}`}
            className="mt-3 inline-block font-semibold text-auth-primary hover:underline"
          >
            Ir a restablecer contraseña
          </Link>
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link to={routePaths.login} className="font-semibold text-auth-primary hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
