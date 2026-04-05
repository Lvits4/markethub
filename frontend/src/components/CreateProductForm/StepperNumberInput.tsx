import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export type StepperNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Paso al pulsar flechas (p. ej. 0.01 para precio, 1 para stock). */
  step: number;
  min?: number;
  /** `money`: decimales con coma/punto; `int`: enteros. */
  mode: 'money' | 'int';
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
};

const shellBase =
  'mt-0.5 flex w-full min-h-[2.75rem] overflow-hidden rounded-md border bg-zinc-50 transition dark:bg-night-950';

const shellNormal =
  'border-zinc-200 focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20 dark:border-night-700 dark:focus-within:border-code-blue dark:focus-within:ring-code-blue/25';

const shellError =
  'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20 dark:border-red-400 dark:focus-within:border-red-400 dark:focus-within:ring-red-400/20';

const inputClass =
  'min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-hidden placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const railBtnClass =
  'flex flex-1 items-center justify-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-night-800 dark:hover:text-zinc-100';

function parseMoney(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number, min: number): string {
  const clamped = Math.max(min, Math.round(n * 100) / 100);
  if (clamped === 0) return '';
  if (Number.isInteger(clamped)) return String(clamped);
  return clamped.toFixed(2);
}

function parseIntLoose(s: string): number {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

export function StepperNumberInput({
  value,
  onChange,
  step,
  min = 0,
  mode,
  placeholder,
  error = false,
  disabled = false,
}: StepperNumberInputProps) {
  const bump = (dir: 1 | -1) => {
    if (disabled) return;
    const delta = dir * step;
    if (mode === 'money') {
      const next = parseMoney(value) + delta;
      onChange(formatMoney(next, min));
      return;
    }
    const next = parseIntLoose(value) + delta;
    onChange(String(Math.max(min, next)));
  };

  return (
    <div
      className={`${shellBase} ${error ? shellError : shellNormal}`}
    >
      <input
        type="number"
        min={min}
        step={step}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      <div
        className="flex w-9 shrink-0 flex-col divide-y divide-zinc-200 border-l border-zinc-200 dark:divide-night-600 dark:border-night-600"
        role="group"
        aria-label="Ajustar valor"
      >
        <button
          type="button"
          disabled={disabled}
          className={`${railBtnClass} rounded-none`}
          aria-label="Aumentar"
          onClick={() => bump(1)}
        >
          <FiChevronUp className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </button>
        <button
          type="button"
          disabled={disabled}
          className={`${railBtnClass} rounded-none`}
          aria-label="Disminuir"
          onClick={() => bump(-1)}
        >
          <FiChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
