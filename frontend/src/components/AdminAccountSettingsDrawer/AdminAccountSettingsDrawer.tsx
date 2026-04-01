import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
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
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-stretch justify-end bg-black/35"
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes de cuenta"
        className="flex h-full w-full max-w-[640px] flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-sky-500/20 dark:bg-[#0b152f]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-sky-500/20 dark:bg-[#0d1938]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
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
        <div className="market-scroll min-h-0 flex-1 overflow-y-auto bg-[#f5f8fc] p-4 dark:bg-[#091126]">
          <AccountSettingsBody onLogoutSuccess={onLogoutSuccess} />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
