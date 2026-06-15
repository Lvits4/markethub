import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { ProductImagesField } from '../CreateProductForm/ProductImagesField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError/mapApiError';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useTheme } from '../../hooks/useTheme/useTheme';
import { useUpdateProfileMutation } from '../../hooks/useUpdateProfileMutation/useUpdateProfileMutation';
import { useUserProfileQuery } from '../../queries/useUserProfileQuery/useUserProfileQuery';
import { buildUploadFolder } from '../../helpers/buildUploadFolder/buildUploadFolder';
import { uploadFile } from '../../requests/fileRequests/fileRequests';

type AccountSettingsBodyProps = {
  className?: string;
  /** Layout más denso (p. ej. panel lateral). */
  compact?: boolean;
  onLogoutSuccess?: () => void;
};

const sectionLabel =
  'text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

function themeModeBadge(theme: 'light' | 'dark') {
  const label = theme === 'dark' ? 'Oscuro' : 'Claro';
  return (
    <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
      {label}
    </span>
  );
}

export function AccountSettingsBody({
  className = '',
  compact = false,
  onLogoutSuccess,
}: AccountSettingsBodyProps) {
  const navigate = useNavigate();

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
          const displayName =
            `${fn} ${ln}`.trim() ||
            profile?.email?.split('@')[0] ||
            user?.email?.split('@')[0] ||
            'usuario';
          const avatarFolder = buildUploadFolder('general', displayName);
          const res = await uploadFile(token, avatarFiles[0], avatarFolder);
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
          onSuccess: (p) => {
            toast.success('Perfil actualizado');
            setAvatarFiles([]);
            setAvatar(p.avatar ?? '');
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    };

    void run();
  };

  const compactStack = compact ? 'flex flex-col gap-6' : '';

  const sectionTop = compact
    ? 'border-t border-zinc-200/60 pt-6 dark:border-night-700/80'
    : '';

  const fieldStack = compact ? 'mt-2 space-y-4' : 'mt-3 space-y-3';
  const inputPad = compact
    ? 'mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-base text-zinc-900 outline-hidden focus:border-forest dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100'
    : 'mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 outline-hidden transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-night-700 dark:bg-night-800/50 dark:text-zinc-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/25';

  const actionsRow = compact
    ? 'mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4'
    : 'mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3';

  const actionBtn = compact
    ? 'h-14 min-h-14 w-full justify-center px-4 text-base sm:min-w-0 sm:flex-1'
    : 'h-11 min-h-11 w-full justify-center px-3 sm:min-w-0 sm:flex-1';

  const themeToggleButton = compact ? (
    <Button type="button" variant="ghost" onClick={toggleTheme}>
      Cambiar
    </Button>
  ) : (
    <Button
      type="button"
      variant="outline"
      className="shrink-0 border-sky-300/70 text-sm font-medium text-sky-800 shadow-sm hover:bg-sky-500/10 dark:border-sky-500/35 dark:bg-night-900 dark:text-sky-300 dark:hover:bg-sky-500/15"
      onClick={toggleTheme}
    >
      Cambiar
    </Button>
  );

  const themeBlock = compact ? (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">Tema</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Modo actual: {theme === 'dark' ? 'Oscuro' : 'Claro'}
        </p>
      </div>
      {themeToggleButton}
    </div>
  ) : (
    <>
      <span className={sectionLabel}>Tema</span>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Modo de pantalla
          </p>
          <div className="mt-1.5">{themeModeBadge(theme)}</div>
        </div>
        {themeToggleButton}
      </div>
    </>
  );

  const authenticatedProfile = (
    <>
      {!compact ? (
        <span className={sectionLabel}>Perfil</span>
      ) : (
        <p className="font-medium text-zinc-900 dark:text-zinc-50">Perfil</p>
      )}
      {profileLoading ? (
        <p
          className={
            compact
              ? 'mt-2 text-sm text-zinc-500'
              : 'mt-3 text-sm text-zinc-500 dark:text-zinc-400'
          }
        >
          Cargando perfil…
        </p>
      ) : (
        <div className={fieldStack}>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Nombre
            </span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputPad}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Apellidos
            </span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputPad}
            />
          </label>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Avatar (opcional)
            </legend>
            <div className={compact ? 'mt-0.5' : 'mt-1'}>
              <ProductImagesField
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
          </fieldset>
        </div>
      )}

      <div className={actionsRow}>
        <Button
          type="button"
          variant="primary"
          className={actionBtn}
          disabled={
            profileLoading || updateProfile.isPending || uploadingAvatar
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
          variant="danger"
          className={actionBtn}
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </>
  );

  const guestBlock = (
    <>
      {!compact ? (
        <span className={sectionLabel}>Cuenta</span>
      ) : null}
      <p
        className={
          compact
            ? 'text-sm text-zinc-500 dark:text-zinc-400'
            : 'mt-2 text-sm text-zinc-500 dark:text-zinc-400'
        }
      >
        Inicia sesión para ver tu cuenta.
      </p>
      <Button
        type="button"
        variant="primary"
        className="mt-4 h-11 w-full justify-center px-3"
        onClick={() => navigate(routePaths.login)}
      >
        Iniciar sesión
      </Button>
    </>
  );

  if (compact) {
    return (
      <div className={`${compactStack} ${className}`.trim()}>
        {themeBlock}
        <div className={sectionTop}>
          {isAuthenticated && user ? authenticatedProfile : guestBlock}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex max-w-2xl flex-col gap-8 sm:gap-10 ${className}`.trim()}>
      <section className="min-w-0">{themeBlock}</section>
      <section className="min-w-0 border-t border-zinc-200/70 pt-8 dark:border-night-700 sm:pt-10">
        {isAuthenticated && user ? authenticatedProfile : guestBlock}
      </section>
    </div>
  );
}
