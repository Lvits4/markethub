import { FiMinus, FiPlus } from 'react-icons/fi';
import { Button } from '../Button/Button';

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  disabled?: boolean;
};

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  disabled,
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () =>
    onChange(max != null ? Math.min(max, value + 1) : value + 1);

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-zinc-100 p-1 dark:bg-night-800">
      <Button
        variant="icon"
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
        className="!rounded-md !p-2"
      >
        <FiMinus className="h-4 w-4" />
      </Button>
      <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <Button
        variant="icon"
        type="button"
        onClick={inc}
        disabled={disabled || (max != null && value >= max)}
        aria-label="Aumentar cantidad"
        className="!rounded-md !p-2"
      >
        <FiPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
