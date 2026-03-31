import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-10">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Ajustes
      </h1>

      <div className="mt-8 space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Tema</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Modo actual: {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={toggleTheme}>
            Cambiar
          </Button>
        </div>

        <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
          {isAuthenticated && user ? (
            <>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                Sesión
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {user.firstName} {user.lastName}
                <br />
                {user.email}
              </p>
              <Button
                type="button"
                variant="primary"
                className="mt-4 w-full justify-center"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Inicia sesión para ver tu cuenta.
              </p>
              <Button
                type="button"
                variant="primary"
                className="mt-4 w-full justify-center"
                onClick={() => navigate(routePaths.login)}
              >
                Iniciar sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
