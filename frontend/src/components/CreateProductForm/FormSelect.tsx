import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';

export type FormSelectOption = { value: string; label: string };

export type FormSelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: boolean;
};

const triggerBaseClass =
  'mt-0.5 flex w-full min-h-[2.75rem] items-center justify-between gap-2 rounded-md border bg-zinc-50 px-3 py-2.5 text-left text-sm outline-none transition dark:bg-night-950';

const triggerNormalClass =
  'border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:text-zinc-100 dark:focus:border-[#1f6feb] dark:focus:ring-[#1f6feb]/25';

const triggerErrorClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder = '—',
  error = false,
}: FormSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selected =
    value === '' ? undefined : options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const displayMuted = value === '';

  function measureAndPlace() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const margin = 12;
    const below = rect.bottom + gap;
    const maxHeight = Math.min(
      280,
      Math.max(120, window.innerHeight - below - margin),
    );
    setCoords({
      top: below,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }

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

    const onResize = () => setOpen(false);

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
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    measureAndPlace();
    setOpen(true);
  };

  const handlePick = (v: string) => {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const listPortal =
    open && coords
      ? createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="market-scroll fixed z-[90] overflow-y-auto overscroll-contain rounded-md border border-zinc-200/90 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-sky-500/20 dark:bg-[#121a2e] dark:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.55)] dark:ring-sky-500/10"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxHeight,
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value === '' ? '__empty__' : opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`mx-1 cursor-pointer rounded-md px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 font-medium text-blue-900 dark:bg-sky-500/15 dark:text-sky-100'
                      : 'text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.06]'
                  }`}
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
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggle}
        className={`${triggerBaseClass} ${error ? triggerErrorClass : triggerNormalClass}`}
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
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform dark:text-zinc-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {listPortal}
    </div>
  );
}
