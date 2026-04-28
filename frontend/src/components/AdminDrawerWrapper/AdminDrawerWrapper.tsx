import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type DrawerVariant = 'admin' | 'market';

type AdminDrawerWrapperProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  variant?: DrawerVariant;
};

const PANEL_BY_VARIANT: Record<DrawerVariant, string> = {
  admin:
    'max-w-admin-drawer border-slate-200/80 bg-white dark:border-blue-500/15 dark:bg-admin-drawer',
  market:
    'max-w-xl border-zinc-200/90 bg-white dark:border-night-700 dark:bg-night-950',
};

const ANIMATION_MS = 300;

export function AdminDrawerWrapper({
  open,
  onClose,
  ariaLabel,
  children,
  variant = 'admin',
}: AdminDrawerWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

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
  }, [open]);

  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => {
      setAnimating(false);
      if (!open) setMounted(false);
    }, ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [animating, open]);

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

  if (!mounted) return null;

  const overlayTint =
    variant === 'market'
      ? visible
        ? 'bg-black/40'
        : 'bg-black/0'
      : '';

  return createPortal(
    <div
      className={`fixed inset-0 z-80 flex cursor-pointer items-stretch justify-end transition-[opacity,background-color] ease-in-out ${overlayTint} ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDuration: `${ANIMATION_MS}ms` }}
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`flex h-full w-full cursor-default flex-col border-l shadow-2xl transition-transform ease-out ${PANEL_BY_VARIANT[variant]} ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionDuration: `${ANIMATION_MS}ms` }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}
