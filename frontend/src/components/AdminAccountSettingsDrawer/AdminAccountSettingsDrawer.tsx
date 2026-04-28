import { FiX } from 'react-icons/fi';
import { AdminDrawerWrapper } from '../AdminDrawerWrapper/AdminDrawerWrapper';
import { Button } from '../Button/Button';
import { AccountSettingsBody } from '../AccountSettingsBody/AccountSettingsBody';

type AdminAccountSettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  onLogoutSuccess?: () => void;
};

export function AdminAccountSettingsDrawer({
  open,
  onClose,
  onLogoutSuccess,
}: AdminAccountSettingsDrawerProps) {
  return (
    <AdminDrawerWrapper open={open} onClose={onClose} ariaLabel="Ajustes de cuenta">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-blue-500/15 dark:bg-admin-drawer-head">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Ajustes de cuenta
        </h2>
        <Button
          type="button"
          variant="icon"
          className="h-9 w-9 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-blue-500/15"
          aria-label="Cerrar panel"
          onClick={onClose}
        >
          <FiX className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto bg-admin-canvas px-6 py-6 dark:bg-admin-canvas-dark">
        <AccountSettingsBody
          compact
          onLogoutSuccess={onLogoutSuccess}
        />
      </div>
    </AdminDrawerWrapper>
  );
}
