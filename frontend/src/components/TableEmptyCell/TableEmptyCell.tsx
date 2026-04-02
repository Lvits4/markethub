import type { ReactNode } from 'react';

/** Carácter usado en celdas como “sin dato” (raya larga). */
export const TABLE_EMPTY_DISPLAY = '—';

/** Alineación respecto al encabezado de la columna (`th` suele ser `text-left` / `text-right`). */
export type TableEmptyAlign = 'start' | 'center' | 'end';

const ALIGN_CLASSES: Record<TableEmptyAlign, string> = {
  start: 'justify-start text-start',
  center: 'justify-center text-center',
  end: 'justify-end text-end',
};

type TableEmptyCellProps = {
  className?: string;
  /** Por defecto `start`, alineado con títulos de cabecera tipo SortHeader (texto a la izquierda, mismo `px` que el `th`). */
  align?: TableEmptyAlign;
};

/**
 * Placeholder de celda vacía: misma línea visual que el título del header (inicio de texto en columnas izquierdas).
 * `whitespace-normal` evita que `truncate` del `td` desplace la raya.
 */
export function TableEmptyCell({
  className = '',
  align = 'start',
}: TableEmptyCellProps) {
  return (
    <span
      className={[
        'flex w-full min-w-0 items-center whitespace-normal',
        ALIGN_CLASSES[align],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {TABLE_EMPTY_DISPLAY}
    </span>
  );
}

/** Para strings que ya vienen como fecha formateada o etiqueta y pueden ser la raya. */
export function renderTableCellString(
  value: string,
  align: TableEmptyAlign = 'start',
): ReactNode {
  return value === TABLE_EMPTY_DISPLAY ? (
    <TableEmptyCell align={align} />
  ) : (
    value
  );
}
