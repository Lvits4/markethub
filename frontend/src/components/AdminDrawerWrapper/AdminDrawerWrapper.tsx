import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type AdminDrawerWrapperProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
};

const ANIMATION_MS = 300;

export function AdminDrawerWrapper({
  open,
  onClose,
  ariaLabel,
  children,
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

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex cursor-pointer items-stretch justify-end transition-opacity duration-[${ANIMATION_MS}ms] ease-in-out ${
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
        className={`flex h-full w-full max-w-admin-drawer cursor-default flex-col border-l border-slate-200/80 bg-white shadow-2xl transition-transform ease-out dark:border-sky-500/20 dark:bg-admin-drawer ${
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
