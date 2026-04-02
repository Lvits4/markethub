import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { ProductImagesField } from '../CreateProductForm/ProductImagesField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useUpdateProfileMutation } from '../../hooks/useUpdateProfileMutation';
import { useUserProfileQuery } from '../../queries/useUserProfileQuery';
import { uploadFile } from '../../requests/fileRequests';

type AccountSettingsBodyProps = {
  className?: string;
  /** Menos aire vertical (p. ej. cajón lateral). */
  compact?: boolean;
  onLogoutSuccess?: () => void;
};

export function AccountSettingsBody({
  className = '',
  compact = false,
  onLogoutSuccess,
}: AccountSettingsBodyProps) {
  const navigate = useNavigate();
  const ids = useId();
  const firstFieldId = `${ids}-first`;
  const lastFieldId = `${ids}-last`;
  const avatarFieldId = `${ids}-avatar`;

  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, token } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
    onLogoutSuccess?.();
  };

  const handleSaveProfile = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (fn.length < 2 || ln.length < 2) {
      toast.error('Nombre y apellidos: mínimo 2 caracteres cada uno');
      return;
    }

    const run = async () => {
      let avatarUrl: string | undefined = avatar.trim() || undefined;
      if (avatarFiles.length > 0) {
        if (!token) {
          toast.error('No hay sesión para subir la imagen.');
          return;
        }
        setUploadingAvatar(true);
        try {
          const res = await uploadFile(token, avatarFiles[0], 'general');
          avatarUrl = res.url;
        } catch (e) {
          toast.error(getErrorMessage(e));
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      updateProfile.mutate(
        {
          firstName: fn,
          lastName: ln,
          avatar: avatarUrl,
        },
        {
          onSuccess: (profile) => {
            toast.success('Perfil actualizado');
            setAvatarFiles([]);
            setAvatar(profile.avatar ?? '');
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    };

    void run();
  };

  const shell = compact
    ? 'space-y-3 rounded-md bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 dark:bg-night-900 dark:ring-night-800'
    : 'space-y-6 rounded-md bg-white p-6 shadow-sm ring-1 ring-zinc-200/80 dark:bg-night-900 dark:ring-night-800';

  const sectionTop = compact
    ? 'border-t border-zinc-100 pt-3 dark:border-night-800'
    : 'border-t border-zinc-100 pt-6 dark:border-night-800';

  const fieldStack = compact ? 'mt-2 space-y-2' : 'mt-4 space-y-3';
  const inputPad = compact
    ? 'mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100'
    : 'mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--color-forest)] dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100';

  const actionsRow = compact
    ? 'mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2'
    : 'mt-6 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3';

  const actionBtn = compact
    ? 'h-10 min-h-10 w-full justify-center px-3 sm:min-w-0 sm:flex-1'
    : 'h-11 min-h-11 w-full justify-center px-3 sm:min-w-0 sm:flex-1';

  return (
    <div className={`${shell} ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">Tema</p>
          <p
            className={
              compact
                ? 'text-xs text-zinc-500 dark:text-zinc-400'
                : 'text-sm text-zinc-500 dark:text-zinc-400'
            }
          >
            Modo actual: {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={toggleTheme}>
          Cambiar
        </Button>
      </div>

      <div className={sectionTop}>
        {isAuthenticated && user ? (
          <>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Perfil</p>
            {profileLoading ? (
              <p
                className={
                  compact
                    ? 'mt-2 text-sm text-zinc-500'
                    : 'mt-4 text-sm text-zinc-500'
                }
              >
                Cargando perfil…
              </p>
            ) : (
              <div className={fieldStack}>
                  <div>
                    <label
                      htmlFor={firstFieldId}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      Nombre
                    </label>
                    <input
                      id={firstFieldId}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputPad}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={lastFieldId}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      Apellidos
                    </label>
                    <input
                      id={lastFieldId}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputPad}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={avatarFieldId}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      Avatar (opcional)
                    </label>
                    <div className={compact ? 'mt-0.5' : 'mt-1'}>
                      <ProductImagesField
                        id={avatarFieldId}
                        files={avatarFiles}
                        onChange={setAvatarFiles}
                        disabled={updateProfile.isPending || uploadingAvatar}
                        multiple={false}
                        compact={compact}
                        protectedImageToken={token}
                        remoteUrls={
                          avatarFiles.length === 0 && avatar.trim()
                            ? [avatar.trim()]
                            : []
                        }
                        onRemoveRemote={() => setAvatar('')}
                        hintText="PNG, JPG, WebP… Se aplicará al guardar el perfil."
                      />
                    </div>
                  </div>
                </div>
            )}

            <div className={actionsRow}>
              <Button
                type="button"
                variant="ghost"
                className={`${actionBtn} border border-zinc-300 bg-white text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700`}
                disabled={
                  profileLoading ||
                  updateProfile.isPending ||
                  uploadingAvatar
                }
                onClick={handleSaveProfile}
              >
                {uploadingAvatar
                  ? 'Subiendo imagen…'
                  : updateProfile.isPending
                    ? 'Guardando…'
                    : 'Guardar perfil'}
              </Button>
              <Button
                type="button"
                variant="cta"
                className={actionBtn}
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Inicia sesión para ver tu cuenta.
            </p>
            <Button
              type="button"
              variant="cta"
              className="mt-4 h-11 w-full justify-center px-3"
              onClick={() => navigate(routePaths.login)}
            >
              Iniciar sesión
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
