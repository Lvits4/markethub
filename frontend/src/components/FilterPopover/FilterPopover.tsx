import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FiSliders } from 'react-icons/fi';
import { FormSelect } from '../CreateProductForm/FormSelect';
import type { FormSelectOption } from '../CreateProductForm/FormSelect';
import { Button } from '../Button/Button';

export type FilterField = {
  key: string;
  label: string;
  options: FormSelectOption[];
};

type FilterValues = Record<string, string>;

type FilterPopoverProps = {
  fields: FilterField[];
  values: FilterValues;
  defaultValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
};

const fieldsetClass =
  'm-0 min-w-0 border-0 p-0';

function hasActiveFilters(
  values: FilterValues,
  defaults: FilterValues,
): boolean {
  return Object.keys(values).some(
    (k) => values[k] !== (defaults[k] ?? ''),
  );
}

export function FilterPopover({
  fields,
  values,
  defaultValues,
  onApply,
  onClear,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (
        t instanceof Element &&
        t.closest('[data-markethub-select-list]')
      ) {
        return;
      }
      const el = containerRef.current;
      if (el && !el.contains(t as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setDraft(values);
      return !prev;
    });
  }, [values]);

  const handleApply = useCallback(() => {
    onApply(draft);
    setOpen(false);
  }, [draft, onApply]);

  const handleClear = useCallback(() => {
    onClear();
    setDraft(defaultValues);
    setOpen(false);
  }, [onClear, defaultValues]);

  const active = hasActiveFilters(values, defaultValues);

  return (
    <div className="relative flex shrink-0" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={handleToggle}
        className={`relative box-border inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-sm transition-colors ${
          active
            ? 'border-forest bg-forest/5 text-forest dark:border-market-dark-accent dark:bg-market-dark-accent/10 dark:text-market-dark-accent'
            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-night-700 dark:bg-night-950 dark:text-zinc-200 dark:hover:bg-night-800'
        }`}
      >
        <FiSliders className="h-4 w-4" aria-hidden />
        Filtrar
        {active ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[10px] font-bold leading-none text-white dark:bg-market-dark-accent">
            {Object.keys(values).filter(
              (k) => values[k] !== (defaultValues[k] ?? ''),
            ).length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Filtros"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-[0_16px_48px_-12px_rgb(0_0_0/0.18)] ring-1 ring-zinc-200/70 dark:border-night-600 dark:bg-night-900 dark:shadow-[0_20px_56px_-12px_rgb(0_0_0/0.55)] dark:ring-night-700/80"
        >
          <div className="flex flex-col gap-4">
            {fields.map((field) => (
              <fieldset key={field.key} className={fieldsetClass}>
                <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {field.label}
                </legend>
                <div className="mt-1">
                  <FormSelect
                    value={draft[field.key] ?? ''}
                    onChange={(v) =>
                      setDraft((prev) => ({ ...prev, [field.key]: v }))
                    }
                    options={field.options}
                    variant="field"
                    triggerClassName="!mt-0 rounded-lg border-zinc-200 bg-zinc-50 py-2.5 dark:border-night-600 dark:bg-night-800/80"
                    listClassName="rounded-xl border-zinc-200/90 dark:border-blue-500/20"
                  />
                </div>
              </fieldset>
            ))}

            <div className="mt-1 flex gap-2 border-t border-zinc-200/80 pt-4 dark:border-night-700">
        <Button
          type="button"
          variant="ghost"
          className="flex-1 justify-center rounded-md border border-zinc-300 bg-zinc-100 py-2.5 text-sm text-zinc-700 hover:bg-zinc-200 dark:border-night-600 dark:bg-night-800 dark:text-zinc-200 dark:hover:bg-night-700"
          onClick={handleClear}
        >
          Limpiar
        </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 justify-center py-2.5 text-sm"
                onClick={handleApply}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
