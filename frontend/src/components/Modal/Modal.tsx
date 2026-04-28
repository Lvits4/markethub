import {
  useCallback,
  useEffect,
  useRef,
  useState,
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

const ANIMATION_MS = 280;

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
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleOverlayPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- portal: montaje y cierre diferido para la transición */
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
          setAnimating(true);
        });
      });
    } else if (mounted) {
      setVisible(false);
      setAnimating(true);
    }
  }, [open, mounted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => {
      setAnimating(false);
      if (!open) setMounted(false);
    }, ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [animating, open]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-80 flex cursor-pointer items-end justify-center p-4 motion-safe:transition-opacity motion-safe:ease-out sm:items-center sm:p-6 ${
        visible ? 'bg-black/45' : 'bg-black/0'
      }`}
      style={{
        transitionDuration: `${ANIMATION_MS}ms`,
      }}
      role="presentation"
      onPointerDown={handleOverlayPointerDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[min(90vh,720px)] w-full cursor-default flex-col overflow-hidden rounded-t-xl bg-white shadow-xl ring-1 ring-zinc-200/80 motion-safe:transition-[transform,opacity] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-night-900 dark:ring-night-700 sm:rounded-xl ${wide ? 'max-w-3xl' : 'max-w-lg'} ${className} ${
          visible
            ? 'translate-y-0 opacity-100 sm:translate-y-0 sm:scale-100'
            : 'translate-y-full opacity-0 sm:translate-y-4 sm:scale-[0.97]'
        }`}
        style={{
          transitionDuration: `${ANIMATION_MS}ms`,
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 bg-white px-5 py-4 dark:border-night-800 dark:bg-night-900 ${headerClassName}`}
        >
          <h2
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
