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
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-3 py-2.5 dark:border-sky-500/20 dark:bg-admin-drawer-head">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Ajustes de cuenta
        </h2>
        <Button
          type="button"
          variant="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-sky-500/20"
          aria-label="Cerrar panel"
          onClick={onClose}
        >
          <FiX className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto bg-admin-canvas p-3 dark:bg-admin-canvas-dark">
        <AccountSettingsBody
          compact
          onLogoutSuccess={onLogoutSuccess}
        />
      </div>
    </AdminDrawerWrapper>
  );
}
