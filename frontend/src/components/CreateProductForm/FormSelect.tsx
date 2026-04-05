import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  /** Nombre accesible del desplegable (p. ej. cuando no hay legend de fieldset asociado). */
  'aria-label'?: string;
  variant?: 'field' | 'compact';
  triggerClassName?: string;
  listClassName?: string;
  /** Altura máxima del panel desplegable (px). Útil para listas largas (p. ej. categorías). */
  listMaxHeightPx?: number;
  /** Campo de texto para filtrar opciones por etiqueta (p. ej. muchas categorías). */
  searchable?: boolean;
  searchPlaceholder?: string;
};

const fieldTriggerBaseClass =
  'mt-0.5 flex w-full min-h-[2.75rem] items-center justify-between gap-2 rounded-md border bg-zinc-50 px-3 py-2.5 text-left text-sm outline-hidden transition dark:bg-night-950';

const fieldTriggerNormalClass =
  'border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-forest focus:ring-2 focus:ring-forest/20 dark:border-night-700 dark:text-zinc-100 dark:focus:border-code-blue dark:focus:ring-code-blue/25';

const fieldTriggerErrorClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

const fieldTriggerDisabledClass =
  'cursor-not-allowed opacity-60';

const compactTriggerBaseClass =
  'flex min-h-0 min-w-[7.5rem] items-center justify-between gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] px-2.5 py-1.5 text-left text-xs font-medium text-zinc-800 shadow-sm outline-hidden ring-admin-primary/0 transition hover:border-zinc-300 focus-visible:ring-2 dark:text-zinc-100 dark:hover:border-night-600';

const compactTriggerDisabledClass = 'cursor-not-allowed opacity-60';

const fieldListPanelClass =
  'fixed z-[90] flex flex-col overflow-hidden overscroll-contain rounded-md border border-zinc-200/90 bg-white shadow-lg ring-1 ring-black/5 dark:border-sky-500/20 dark:bg-admin-dropdown dark:shadow-admin-dropdown dark:ring-sky-500/10';

const fieldListUlClass =
  'market-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-1';

const compactListPanelClass =
  'fixed z-[90] flex min-w-full flex-col overflow-hidden overscroll-contain rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-lg ring-1 ring-black/5 dark:ring-white/10';

const compactListUlClass =
  'market-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-0.5';

const listSearchInputClass =
  'w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-sm text-zinc-900 outline-hidden placeholder:text-zinc-400 focus:border-forest focus:ring-2 focus:ring-forest/20 dark:border-night-600 dark:bg-night-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-code-blue dark:focus:ring-code-blue/25';

export function FormSelect({
  value,
  onChange,
  options,
  placeholder = '—',
  error = false,
  disabled = false,
  'aria-label': ariaLabel,
  variant = 'field',
  triggerClassName,
  listClassName,
  listMaxHeightPx = 280,
  searchable = false,
  searchPlaceholder = 'Buscar…',
}: FormSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<ListPlacementCoords | null>(null);
  const [listFilter, setListFilter] = useState('');

  const selected =
    value === '' ? undefined : options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;
  const displayMuted = value === '';

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const q = listFilter.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.value === '' || o.label.toLowerCase().includes(q),
    );
  }, [searchable, options, listFilter]);

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
      const maxHeight = Math.min(
        listMaxHeightPx,
        Math.max(80, spaceAbove),
      );
      setCoords({
        placement: 'above',
        bottom,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    } else {
      const top = rect.bottom + gap;
      const maxHeight = Math.min(
        listMaxHeightPx,
        Math.max(80, spaceBelow),
      );
      setCoords({
        placement: 'below',
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }
  }, [listMaxHeightPx]);

  useEffect(() => {
    if (open && searchable) {
      setListFilter('');
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;

    function isScrollInsidePanel(target: EventTarget | null) {
      const panel = panelRef.current;
      if (!panel || !(target instanceof Node)) return false;
      return target === panel || panel.contains(target);
    }

    const onScroll = (e: Event) => {
      if (isScrollInsidePanel(e.target)) return;
      setOpen(false);
    };

    const onResize = () => {
      measureAndPlace();
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const panel = panelRef.current;
      const t = e.target;
      if (t instanceof Node) {
        if (root?.contains(t) || panel?.contains(t)) return;
      }
      if (panel) {
        const r = panel.getBoundingClientRect();
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

  const panelBoxClass = `${isCompact ? compactListPanelClass : fieldListPanelClass}${listClassName ? ` ${listClassName}` : ''}`;
  const ulScrollClass = isCompact ? compactListUlClass : fieldListUlClass;

  const chevronClass = isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const panelPositionStyle =
    coords?.placement === 'below'
      ? {
          top: coords.top,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxHeight,
          bottom: 'auto' as const,
        }
      : coords
        ? {
            bottom: coords.bottom,
            left: coords.left,
            width: coords.width,
            maxHeight: coords.maxHeight,
            top: 'auto' as const,
          }
        : null;

  const listPortal =
    open && coords && panelPositionStyle
      ? createPortal(
          <div
            ref={panelRef}
            data-markethub-select-list
            className={panelBoxClass}
            style={panelPositionStyle}
          >
            {searchable ? (
              <div className="shrink-0 border-b border-zinc-200/90 p-2 dark:border-sky-500/20">
                <input
                  type="search"
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  aria-label={searchPlaceholder}
                  className={listSearchInputClass}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : null}
            <ul role="listbox" className={ulScrollClass}>
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Sin coincidencias
                </li>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  const optionClass = isCompact
                    ? isSelected
                      ? 'cursor-pointer px-3 py-1.5 text-left text-xs font-semibold text-admin-primary bg-[var(--admin-primary-soft)] dark:text-market-dark-accent'
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
                })
              )}
            </ul>
          </div>,
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
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
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
