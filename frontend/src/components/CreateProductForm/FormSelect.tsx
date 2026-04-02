import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';

export type FormSelectOption = { value: string; label: string };

type ListPlacementCoords =
  | {
      placement: 'below';
      top: number;
      left: number;
      width: number;
      maxHeight: number;
    }
  | {
      placement: 'above';
      bottom: number;
      left: number;
      width: number;
      maxHeight: number;
    };

export type FormSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  /** Para enlazar el botón a un título externo (p. ej. gráfico admin). */
  'aria-labelledby'?: string;
  variant?: 'field' | 'compact';
  triggerClassName?: string;
  listClassName?: string;
};

const fieldTriggerBaseClass =
  'mt-0.5 flex w-full min-h-[2.75rem] items-center justify-between gap-2 rounded-md border bg-zinc-50 px-3 py-2.5 text-left text-sm outline-none transition dark:bg-night-950';

const fieldTriggerNormalClass =
  'border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:text-zinc-100 dark:focus:border-[#1f6feb] dark:focus:ring-[#1f6feb]/25';

const fieldTriggerErrorClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

const fieldTriggerDisabledClass =
  'cursor-not-allowed opacity-60';

const compactTriggerBaseClass =
  'flex min-h-0 min-w-[7.5rem] items-center justify-between gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-2.5 py-1.5 text-left text-xs font-medium text-zinc-800 shadow-sm outline-none ring-[var(--admin-primary)]/0 transition hover:border-zinc-300 focus-visible:ring-2 dark:text-zinc-100 dark:hover:border-night-600';

const compactTriggerDisabledClass = 'cursor-not-allowed opacity-60';

const fieldListClass =
  'market-scroll fixed z-[90] overflow-y-auto overscroll-contain rounded-md border border-zinc-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-sky-500/20 dark:bg-[#121a2e] dark:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.55)] dark:ring-sky-500/10';

const compactListClass =
  'market-scroll fixed z-[90] min-w-full overflow-y-auto overscroll-contain rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] py-0.5 shadow-lg ring-1 ring-black/5 dark:ring-white/10';

export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = '—',
  error = false,
  disabled = false,
  'aria-labelledby': ariaLabelledBy,
  variant = 'field',
  triggerClassName,
  listClassName,
}: FormSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<ListPlacementCoords | null>(null);

  const selected =
    value === '' ? undefined : options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const displayMuted = value === '';

  const measureAndPlace = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const spaceBelow = window.innerHeight - rect.bottom - margin - gap;
    const spaceAbove = rect.top - margin - gap;
    const minList = 120;
    const openAbove = spaceBelow < minList && spaceAbove > spaceBelow;

    if (openAbove) {
      const bottom = window.innerHeight - rect.top + gap;
      const maxHeight = Math.min(280, Math.max(80, spaceAbove));
      setCoords({
        placement: 'above',
        bottom,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    } else {
      const top = rect.bottom + gap;
      const maxHeight = Math.min(280, Math.max(80, spaceBelow));
      setCoords({
        placement: 'below',
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    function isScrollInsideList(target: EventTarget | null) {
      const list = listRef.current;
      if (!list || !(target instanceof Node)) return false;
      return target === list || list.contains(target);
    }

    const onScroll = (e: Event) => {
      if (isScrollInsideList(e.target)) return;
      setOpen(false);
    };

    const onResize = () => {
      measureAndPlace();
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const list = listRef.current;
      const t = e.target;
      if (t instanceof Node) {
        if (root?.contains(t) || list?.contains(t)) return;
      }
      if (list) {
        const r = list.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return;
        }
      }
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, measureAndPlace]);

  const toggle = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    measureAndPlace();
    setOpen(true);
  };

  const handlePick = (v: string) => {
    if (disabled) return;
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const isCompact = variant === 'compact';

  const triggerClass =
    variant === 'compact'
      ? `${compactTriggerBaseClass}${disabled ? ` ${compactTriggerDisabledClass}` : ''}${triggerClassName ? ` ${triggerClassName}` : ''}`
      : `${fieldTriggerBaseClass} ${error ? fieldTriggerErrorClass : fieldTriggerNormalClass}${disabled ? ` ${fieldTriggerDisabledClass}` : ''}${triggerClassName ? ` ${triggerClassName}` : ''}`;

  const listBoxClass = `${isCompact ? compactListClass : fieldListClass}${listClassName ? ` ${listClassName}` : ''}`;

  const chevronClass = isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const listPortal =
    open && coords
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className={listBoxClass}
            style={
              coords.placement === 'below'
                ? {
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    maxHeight: coords.maxHeight,
                    bottom: 'auto',
                  }
                : {
                    bottom: coords.bottom,
                    left: coords.left,
                    width: coords.width,
                    maxHeight: coords.maxHeight,
                    top: 'auto',
                  }
            }
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              const optionClass = isCompact
                ? isSelected
                  ? 'cursor-pointer px-3 py-1.5 text-left text-xs font-semibold text-[var(--admin-primary)] bg-[var(--admin-primary-soft)] dark:text-blue-400'
                  : 'cursor-pointer px-3 py-1.5 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-night-800/80'
                : isSelected
                  ? 'mx-1 cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium bg-blue-50 text-blue-900 dark:bg-sky-500/15 dark:text-sky-100'
                  : 'mx-1 cursor-pointer rounded-md px-3 py-2.5 text-sm text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.06]';
              return (
                <li
                  key={opt.value === '' ? '__empty__' : opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={optionClass}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(opt.value)}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={isCompact ? 'relative w-auto shrink-0' : 'relative w-full'}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={toggle}
        className={triggerClass}
      >
        <span
          className={
            displayMuted
              ? 'min-w-0 flex-1 truncate text-zinc-400 dark:text-zinc-500'
              : 'min-w-0 flex-1 truncate'
          }
        >
          {displayLabel}
        </span>
        <FiChevronDown
          className={`${chevronClass} shrink-0 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {listPortal}
    </div>
  );
}
