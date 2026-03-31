import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useUpdateProfileMutation } from '../../hooks/useUpdateProfileMutation';
import { useUserProfileQuery } from '../../queries/useUserProfileQuery';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setAvatar(profile.avatar ?? '');
    }
  }, [profile]);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
  };

  const handleSaveProfile = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn.length < 2 || ln.length < 2) {
      toast.error('Nombre y apellidos: mínimo 2 caracteres cada uno');
      return;
    }
    updateProfile.mutate(
      {
        firstName: fn,
        lastName: ln,
        avatar: avatar.trim() || undefined,
      },
      {
        onSuccess: () => toast.success('Perfil actualizado'),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:pb-10 sm:pt-8 lg:pb-12">
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

              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  Perfil
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Los cambios se guardan en el servidor.
                </p>
                {profileLoading ? (
                  <p className="mt-4 text-sm text-zinc-500">Cargando perfil…</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label
                        htmlFor="profile-first"
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                      >
                        Nombre
                      </label>
                      <input
                        id="profile-first"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-last"
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                      >
                        Apellidos
                      </label>
                      <input
                        id="profile-last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-avatar"
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                      >
                        URL del avatar (opcional)
                      </label>
                      <input
                        id="profile-avatar"
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                        placeholder="https://…"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full justify-center sm:w-auto"
                      disabled={updateProfile.isPending}
                      onClick={handleSaveProfile}
                    >
                      {updateProfile.isPending ? 'Guardando…' : 'Guardar perfil'}
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full justify-center"
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
