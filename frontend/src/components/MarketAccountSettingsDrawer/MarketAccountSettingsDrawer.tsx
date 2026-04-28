import { FiX } from 'react-icons/fi';
import { AccountSettingsBody } from '../AccountSettingsBody/AccountSettingsBody';
import { AdminDrawerWrapper } from '../AdminDrawerWrapper/AdminDrawerWrapper';
import { Button } from '../Button/Button';

type MarketAccountSettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  onLogoutSuccess?: () => void;
};

export function MarketAccountSettingsDrawer({
  open,
  onClose,
  onLogoutSuccess,
}: MarketAccountSettingsDrawerProps) {
  return (
    <AdminDrawerWrapper
      open={open}
      onClose={onClose}
      ariaLabel="Ajustes de cuenta"
      variant="market"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white px-7 py-5 dark:border-night-700 dark:bg-night-900">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Ajustes de cuenta
        </h2>
        <Button
          type="button"
          variant="icon"
          className="h-10 w-10 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-night-800"
          aria-label="Cerrar panel"
          onClick={onClose}
        >
          <FiX className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto bg-zinc-50/90 px-7 py-7 dark:bg-night-950">
        <AccountSettingsBody compact onLogoutSuccess={onLogoutSuccess} />
      </div>
    </AdminDrawerWrapper>
  );
}
