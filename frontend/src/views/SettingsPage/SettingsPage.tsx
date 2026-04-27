import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AccountSettingsBody } from '../../components/AccountSettingsBody/AccountSettingsBody';
import { routePaths } from '../../config/routes';

export function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:pb-10 sm:pt-6 lg:px-6 lg:pb-12">
      <nav
        className="mb-2 flex flex-wrap items-center gap-2 text-sm"
        aria-label="Navegación"
      >
        <Link
          to={routePaths.catalog}
          className="inline-flex items-center gap-1.5 rounded-md py-1.5 pl-1 pr-2 text-sm font-medium text-zinc-700 transition hover:text-sky-600 dark:text-zinc-300 dark:hover:text-sky-400"
        >
          <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Atrás
        </Link>
        <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
          /
        </span>
        <span className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
          Ajustes
        </span>
      </nav>

      <div className="flex flex-col gap-2 lg:gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            Ajustes de cuenta
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Tema, datos del perfil y cierre de sesión.
          </p>
        </div>
      </div>

      <AccountSettingsBody className="mt-4" />
    </div>
  );
}
