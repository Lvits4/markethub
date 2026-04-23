import { useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export type TablePaginationProps = {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function TablePagination({
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      if (!Number.isFinite(raw)) return;
      const next = Math.min(999, Math.max(1, Math.trunc(raw)));
      onPageSizeChange(next);
    },
    [onPageSizeChange],
  );

  return (
    <div className="table-pagination-root">
      <div className="table-pagination-cell table-pagination-cell--controls">
        <span className="table-pagination-rows-label">Filas por página</span>
        <input
          type="number"
          min={1}
          max={999}
          value={pageSize}
          onChange={handlePageSizeChange}
          className="table-pagination-rows-input"
          aria-label="Cantidad de filas por página"
        />
      </div>
      <span className="table-pagination-pages">
        {page}<span className="table-pagination-pages-sep">–</span>{totalPages}
      </span>
      <div className="table-pagination-cell table-pagination-cell--nav">
        <button
          type="button"
          className="table-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Página anterior"
        >
          <FiChevronLeft className="table-pagination-btn-icon" aria-hidden />
        </button>
        <button
          type="button"
          className="table-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label="Página siguiente"
        >
          <FiChevronRight className="table-pagination-btn-icon" aria-hidden />
        </button>
      </div>
    </div>
  );
}
