import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Panel más ancho para contenido denso (p. ej. JSON o tablas). */
  wide?: boolean;
  /** Clases extra del panel (p. ej. `!max-w-4xl rounded-2xl`). */
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  /** Contenedor scrollable que envuelve a `children`. */
  contentWrapperClassName?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  className = '',
  headerClassName = '',
  titleClassName = '',
  closeButtonClassName = '',
  contentWrapperClassName = '',
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

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

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex cursor-pointer items-end justify-center bg-black/45 p-4 sm:items-center sm:p-6"
      role="presentation"
      onPointerDown={handleOverlayPointerDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[min(90vh,720px)] w-full cursor-default flex-col overflow-hidden rounded-t-xl bg-white shadow-xl ring-1 ring-zinc-200/80 dark:bg-night-900 dark:ring-night-700 sm:rounded-xl ${wide ? 'max-w-3xl' : 'max-w-lg'} ${className}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 bg-white px-5 py-4 dark:border-night-800 dark:bg-night-900 ${headerClassName}`}
        >
          <h2
            id={titleId}
            className={`text-lg font-semibold text-zinc-900 dark:text-zinc-50 ${titleClassName}`}
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="icon"
            className={`shrink-0 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 ${closeButtonClassName}`}
            aria-label="Cerrar"
            onClick={onClose}
          >
            <span className="text-xl leading-none" aria-hidden>
              ×
            </span>
          </Button>
        </div>
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${contentWrapperClassName ? contentWrapperClassName : 'overflow-hidden'}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
