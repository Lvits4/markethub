import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMail,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import {
  AdminDetailCompactField,
  AdminDetailFieldsGrid,
  AdminDetailHeroSplit,
  AdminDetailImageFrame,
  AdminDetailPanelRoot,
  AdminDetailPanelTop,
  AdminDetailScrollSection,
  AdminDetailStatTile,
  AdminDetailStatsGrid,
  AdminDetailTextCard,
  AdminDetailTitleRow,
} from '../../components/AdminDetailPanel/AdminDetailPanel';
import { AdminStatusBadge } from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import {
  renderTableCellString,
  TableEmptyCell,
} from '../../components/TableEmptyCell/TableEmptyCell';
import { Modal } from '../../components/Modal/Modal';
import { AdminCreateUserForm } from '../../components/AdminCreateUserForm/AdminCreateUserForm';
import { AdminEditUserForm } from '../../components/AdminEditUserForm/AdminEditUserForm';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAdminDeleteUser } from '../../hooks/useAdminDeleteUser';
import { useAuth } from '../../hooks/useAuth';
import { useAdminUsersQuery } from '../../queries/useAdminUsersQuery';
import type { AdminUserRow } from '../../types/admin';

type SortKey = 'name' | 'email' | 'role' | 'date' | 'active';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const NUM_COLS = 6;
const COL_WIDTH = `${100 / NUM_COLS}%`;

function UsersTableColgroup() {
  return (
    <colgroup>
      {Array.from({ length: NUM_COLS }, (__, i) => (
        <col key={i} style={{ width: COL_WIDTH }} />
      ))}
    </colgroup>
  );
}

function fullName(u: AdminUserRow): string {
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
}

function nameSortValue(u: AdminUserRow): string {
  return fullName(u).toLowerCase() || u.email.toLowerCase();
}

function compareUsers(
  a: AdminUserRow,
  b: AdminUserRow,
  key: SortKey,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (key) {
    case 'name':
      cmp = nameSortValue(a).localeCompare(nameSortValue(b), 'es');
      break;
    case 'email':
      cmp = a.email.localeCompare(b.email, 'es', { sensitivity: 'base' });
      break;
    case 'role':
      cmp = a.role.localeCompare(b.role, 'es', { sensitivity: 'base' });
      break;
    case 'date':
      cmp = (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      break;
    case 'active':
      cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
      break;
    default:
      cmp = 0;
  }
  return dir === 'asc' ? cmp : -cmp;
}

function matchesSearch(u: AdminUserRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const chunks = [
    u.firstName,
    u.lastName,
    u.email,
    u.role,
    u.id,
  ];
  return chunks.some((c) => (c ?? '').toLowerCase().includes(n));
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function UserDetailsPanel({ user }: { user: AdminUserRow }) {
  const [detailTab, setDetailTab] = useState<'cuenta' | 'ayuda'>('cuenta');
  const displayName = fullName(user) || user.email;

  return (
    <AdminDetailPanelRoot>
      <AdminDetailPanelTop>
        <AdminDetailTitleRow
          title={displayName}
          subtitle={user.email}
          badges={
            <>
              <AdminStatusBadge
                tone="blue"
                className="!px-2 !py-0.5 !text-[10px]"
              >
                {user.role}
              </AdminStatusBadge>
              <AdminStatusBadge tone={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Activo' : 'Inactivo'}
              </AdminStatusBadge>
            </>
          }
        />

        <AdminDetailStatsGrid>
          <AdminDetailStatTile label="Rol" value={user.role} hint="permiso" />
          <AdminDetailStatTile
            label="Estado"
            value={user.isActive ? 'Activo' : 'Inactivo'}
            hint="cuenta"
          />
        </AdminDetailStatsGrid>

        <AdminDetailHeroSplit
          image={
            <AdminDetailImageFrame ariaLabel="Avatar del usuario">
              <FiUser
                className="h-12 w-12 text-slate-400 dark:text-slate-500"
                aria-hidden
              />
            </AdminDetailImageFrame>
          }
          fields={
            <AdminDetailFieldsGrid>
              <AdminDetailCompactField label="Nombre" icon={FiUser}>
                {fullName(user) || '—'}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Correo" icon={FiMail}>
                {user.email}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Rol" icon={FiShield}>
                {user.role}
              </AdminDetailCompactField>
              <AdminDetailCompactField label="Alta" icon={FiCalendar}>
                {formatDate(user.createdAt)}
              </AdminDetailCompactField>
            </AdminDetailFieldsGrid>
          }
        />
      </AdminDetailPanelTop>

      <AdminDetailScrollSection
        tablistLabel="Cuenta y ayuda"
        tabs={[
          { id: 'cuenta', label: 'Cuenta' },
          { id: 'ayuda', label: 'Ayuda' },
        ]}
        activeTab={detailTab}
        onTabChange={(id) => setDetailTab(id as 'cuenta' | 'ayuda')}
      >
        {detailTab === 'cuenta' ? (
          <div className="space-y-3 pb-1">
            <AdminDetailTextCard title="Identificador (UUID)">
              <span className="break-all font-mono text-xs">{user.id}</span>
            </AdminDetailTextCard>
          </div>
        ) : (
          <div className="space-y-3 pb-1">
            <AdminDetailTextCard title="Acciones en la tabla">
              Para cambiar el estado activo o inactivo, el rol o los datos de la
              cuenta, o para eliminar de forma definitiva un usuario, utiliza los
              botones de la fila correspondiente en la tabla principal.
            </AdminDetailTextCard>
          </div>
        )}
      </AdminDetailScrollSection>
    </AdminDetailPanelRoot>
  );
}

function UserDetailsDrawer({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUserRow | null;
}) {
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

  if (!open || !user) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex cursor-pointer items-stretch justify-end bg-black/35"
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de usuario"
        className="flex h-full w-full max-w-[640px] cursor-default flex-col border-l border-slate-200/80 bg-white shadow-2xl dark:border-sky-500/20 dark:bg-[#0b152f]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-sky-500/20 dark:bg-[#0d1938]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Panel de detalles
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="icon"
              className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-sky-500/20"
              aria-label="Cerrar panel"
              onClick={onClose}
            >
              <FiX className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f8fc] dark:bg-[#091126]">
          <UserDetailsPanel user={user} />
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey, direction: SortDir) => void;
  align?: 'left' | 'right';
}) {
  const active = activeKey === sortKey;
  return (
    <th
      className={`px-4 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div
        className={`inline-flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span className="leading-tight">{label}</span>
        <span className="inline-flex shrink-0 flex-col items-center gap-0 leading-none">
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'asc' ? 'text-[var(--color-forest)]' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-sky-950/50 ${active && dir === 'desc' ? 'text-[var(--color-forest)]' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} descendente`}
            onClick={() => onSort(sortKey, 'desc')}
          >
            <FiChevronDown className="h-3 w-3" aria-hidden />
          </button>
        </span>
      </div>
    </th>
  );
}

export function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const { data, isLoading, isError } = useAdminUsersQuery();
  const deleteUser = useAdminDeleteUser();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const busy = deleteUser.isPending;

  const tableHeaderScrollRef = useRef<HTMLDivElement>(null);
  const tableBodyScrollRef = useRef<HTMLDivElement>(null);

  const onTableHeaderScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const left = e.currentTarget.scrollLeft;
      const body = tableBodyScrollRef.current;
      if (body && body.scrollLeft !== left) body.scrollLeft = left;
    },
    [],
  );

  const onTableBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const left = e.currentTarget.scrollLeft;
      const header = tableHeaderScrollRef.current;
      if (header && header.scrollLeft !== left) header.scrollLeft = left;
    },
    [],
  );

  const users = Array.isArray(data) ? data : [];

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = users.filter((u) => matchesSearch(u, q));
    return [...list].sort((a, b) => compareUsers(a, b, sortKey, sortDir));
  }, [users, search, sortKey, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / pageSize) || 1,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  const handleSort = useCallback((key: SortKey, direction: SortDir) => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const drawerUser = useMemo(
    () => (viewUserId ? users.find((u) => u.id === viewUserId) ?? null : null),
    [users, viewUserId],
  );

  const editUser = useMemo(
    () => (editUserId ? users.find((u) => u.id === editUserId) ?? null : null),
    [users, editUserId],
  );

  const isSelf = (id: string) =>
    Boolean(authUser?.id && id === authUser.id);

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const deletedId = userToDelete.id;
    deleteUser.mutate(deletedId, {
      onSuccess: () => {
        toast.success('Usuario eliminado');
        setUserToDelete(null);
        if (viewUserId === deletedId) setViewUserId(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h2 className="flex shrink-0 items-center gap-2.5 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        <FiUsers
          className="h-7 w-7 shrink-0 text-zinc-900 dark:text-zinc-50"
          aria-hidden
        />
        Usuarios
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Crea, edita o elimina cuentas. Activa o desactiva usuarios desde{' '}
        <strong>Editar</strong> (casilla «Cuenta activa»). No puedes borrarte ni
        desactivarte a ti mismo. La papelera elimina de forma permanente tiendas,
        productos y pedidos vinculados a ese usuario.
      </p>

      {isLoading ? (
        <p className="text-center text-sm text-zinc-500">Cargando…</p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600">
          No se pudieron cargar los usuarios.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo, rol o ID…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
                aria-label="Buscar usuarios"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  aria-label="Limpiar búsqueda"
                >
                  <FiX className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
            <Button
              type="button"
              variant="cta"
              className="h-11 min-h-11 shrink-0 px-6 py-0"
              onClick={() => setCreateOpen(true)}
            >
              Crear usuario
            </Button>
          </div>

          <div className="admin-table-panel">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                ref={tableHeaderScrollRef}
                onScroll={onTableHeaderScroll}
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-sky-500/20"
              >
                <table className="w-full min-w-[1040px] table-fixed border-collapse text-left text-sm">
                  <UsersTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-[#0f1a38]/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <SortHeader
                        label="Usuario"
                        sortKey="name"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Correo"
                        sortKey="email"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Rol"
                        sortKey="role"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Estado"
                        sortKey="active"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="Alta"
                        sortKey="date"
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Acción
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div
                ref={tableBodyScrollRef}
                onScroll={onTableBodyScroll}
                className="market-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto"
              >
                <table className="w-full min-w-[1040px] table-fixed border-collapse text-left text-sm">
                  <UsersTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={NUM_COLS}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {users.length === 0
                            ? 'No hay usuarios registrados.'
                            : 'Ningún usuario coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-sky-500/[0.12] dark:hover:bg-sky-950/20"
                        >
                          <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {fullName(u) || <TableEmptyCell />}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] leading-tight text-slate-400 dark:text-slate-500">
                              {u.id.slice(0, 8)}…
                            </p>
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {u.email}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <AdminStatusBadge
                              tone="blue"
                              className="!px-2.5 !py-0.5 !text-[11px]"
                            >
                              {u.role}
                            </AdminStatusBadge>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <AdminStatusBadge tone={u.isActive ? 'success' : 'danger'}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </AdminStatusBadge>
                          </td>
                          <td className="px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {renderTableCellString(formatDate(u.createdAt))}
                          </td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-[#2563eb] hover:bg-blue-500/10 dark:!text-sky-400 dark:hover:bg-sky-500/15"
                                aria-label={`Ver detalle de ${u.email}`}
                                onClick={() => setViewUserId(u.id)}
                              >
                                <FiEye className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-yellow-600 hover:bg-yellow-500/15 dark:!text-sky-300 dark:hover:bg-sky-500/15"
                                aria-label={`Editar ${u.email}`}
                                disabled={busy}
                                onClick={() => setEditUserId(u.id)}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="!text-red-600 hover:bg-red-500/10 dark:!text-red-400 dark:hover:bg-red-950/35"
                                aria-label={
                                  isSelf(u.id)
                                    ? 'No puedes eliminar tu propio usuario'
                                    : `Eliminar permanentemente a ${u.email}`
                                }
                                disabled={busy || isSelf(u.id)}
                                title={
                                  isSelf(u.id)
                                    ? 'No puedes eliminar tu propio usuario'
                                    : 'Borrado definitivo'
                                }
                                onClick={() => setUserToDelete(u)}
                              >
                                <FiTrash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 border-t border-slate-200/80 bg-slate-50/75 px-4 py-3 backdrop-blur-sm dark:border-sky-500/18 dark:bg-[#0c1630]/88 dark:backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {filteredSorted.length === 0
                    ? '0 usuarios'
                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredSorted.length)} de ${filteredSorted.length}`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Página{' '}
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                    {page}
                  </span>{' '}
                  de{' '}
                  <span className="tabular-nums">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Página anterior"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 min-w-8 px-2"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-label="Página siguiente"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Por página</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={pageSize}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      if (!Number.isFinite(raw)) return;
                      const next = Math.min(
                        999,
                        Math.max(1, Math.trunc(raw)),
                      );
                      setPageSize(next);
                    }}
                    className="page-size-input h-9 w-16 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/25 dark:border-sky-500/30 dark:bg-[#0b1735] dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/25"
                    aria-label="Cantidad de elementos por página"
                  />
                </label>
              </div>
            </div>
          </div>

          <UserDetailsDrawer
            open={viewUserId != null && drawerUser != null}
            onClose={() => setViewUserId(null)}
            user={drawerUser}
          />

          <Modal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            title="Crear usuario"
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <AdminCreateUserForm
                onSuccess={() => setCreateOpen(false)}
                onCancel={() => setCreateOpen(false)}
              />
            </div>
          </Modal>

          <Modal
            open={editUserId != null && editUser != null}
            onClose={() => setEditUserId(null)}
            title={
              editUser
                ? `Editar: ${editUser.email}`
                : 'Editar usuario'
            }
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              {editUser ? (
                <AdminEditUserForm
                  user={editUser}
                  onSuccess={() => setEditUserId(null)}
                  onCancel={() => setEditUserId(null)}
                />
              ) : null}
            </div>
          </Modal>

          <Modal
            open={userToDelete != null}
            onClose={() => setUserToDelete(null)}
            title="Confirmar eliminación permanente"
          >
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                ¿Seguro que quieres eliminar de forma definitiva al usuario{' '}
                <span className="font-semibold">
                  «{userToDelete ? fullName(userToDelete) || userToDelete.email : ''}»
                </span>
                {' '}(
                <span className="font-mono text-xs">
                  {userToDelete?.email}
                </span>
                )?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Se borrarán sus pedidos como cliente, favoritos, carrito y todas
                sus tiendas con productos y pedidos de esas tiendas. No se puede
                deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90">
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-40 justify-center border border-zinc-300 bg-white px-4 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
                onClick={() => setUserToDelete(null)}
                disabled={deleteUser.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:hover:bg-rose-800"
                onClick={handleConfirmDelete}
                disabled={deleteUser.isPending}
              >
                {deleteUser.isPending ? 'Eliminando…' : 'Eliminar usuario'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
