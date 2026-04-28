import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { AdminStatusBadge } from '../../components/AdminStatusBadge/AdminStatusBadge';
import { Button } from '../../components/Button/Button';
import { FilterPopover } from '../../components/FilterPopover/FilterPopover';
import type { FilterField } from '../../components/FilterPopover/FilterPopover';
import { TablePagination } from '../../components/TablePagination/TablePagination';
import { TableEmptyCell } from '../../components/TableEmptyCell/TableEmptyCell';
import { Modal } from '../../components/Modal/Modal';
import { AdminCreateUserForm } from '../../components/AdminCreateUserForm/AdminCreateUserForm';
import { AdminEditUserForm } from '../../components/AdminEditUserForm/AdminEditUserForm';
import { adminEditIconButtonClass } from '../../helpers/adminEditIconButtonClass/adminEditIconButtonClass';
import { getErrorMessage } from '../../helpers/mapApiError/mapApiError';
import { useAdminDeleteUser } from '../../hooks/useAdminDeleteUser/useAdminDeleteUser';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useAdminUsersQuery } from '../../queries/useAdminUsersQuery/useAdminUsersQuery';
import type { AdminUserRow } from '../../types/admin/admin';

type SortKey = 'name' | 'email' | 'role' | 'active';
type SortDir = 'asc' | 'desc';

const DEFAULT_PAGE_SIZE = 10;
const ROW_NUM_WIDTH = '3.5%';
const NUM_DATA_COLS = 5;

const USER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const USER_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'SELLER', label: 'SELLER' },
  { value: 'CUSTOMER', label: 'CUSTOMER' },
];

const USER_FILTER_DEFAULTS = { status: '', role: '' };

function UsersTableColgroup() {
  return (
    <colgroup>
      <col style={{ width: ROW_NUM_WIDTH }} />
      {Array.from({ length: NUM_DATA_COLS }, (__, i) => (
        <col key={i} style={{ width: `${(100 - 3.5) / NUM_DATA_COLS}%` }} />
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

function matchesUserFilter(
  u: AdminUserRow,
  filters: { status: string; role: string },
): boolean {
  if (filters.status === 'active' && !u.isActive) return false;
  if (filters.status === 'inactive' && u.isActive) return false;
  if (filters.role && u.role !== filters.role) return false;
  return true;
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
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-white/10 ${active && dir === 'asc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={`Ordenar ${label} ascendente`}
            onClick={() => onSort(sortKey, 'asc')}
          >
            <FiChevronUp className="h-3 w-3" aria-hidden />
          </button>
          <button
            type="button"
            className={`rounded p-0 leading-none transition-colors hover:bg-slate-200 dark:hover:bg-white/10 ${active && dir === 'desc' ? 'text-forest' : 'text-slate-400 dark:text-slate-500'}`}
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
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [userFilters, setUserFilters] = useState(USER_FILTER_DEFAULTS);
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

  const userFilterFields: FilterField[] = useMemo(
    () => [
      { key: 'status', label: 'Estado', options: USER_STATUS_OPTIONS },
      { key: 'role', label: 'Rol', options: USER_ROLE_OPTIONS },
    ],
    [],
  );

  const filteredSorted = useMemo(() => {
    const q = search.trim();
    const list = users
      .filter((u) => matchesSearch(u, q))
      .filter((u) => matchesUserFilter(u, userFilters));
    return [...list].sort((a, b) => compareUsers(a, b, sortKey, sortDir));
  }, [users, search, sortKey, sortDir, userFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / pageSize) || 1,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, userFilters]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  const handleSort = useCallback((key: SortKey, direction: SortDir) => {
    setSortKey(key);
    setSortDir(direction);
  }, []);

  const editUser = useMemo(
    () => (editUserId ? users.find((u) => u.id === editUserId) ?? null : null),
    [users, editUserId],
  );

  const isSelf = (id: string) =>
    Boolean(authUser?.id && id === authUser.id);

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success('Usuario eliminado');
        setUserToDelete(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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
                placeholder="Buscar por nombre, correo o cliente…"
                className={`box-border h-11 w-full rounded-md border border-zinc-200 bg-white py-0 pl-10 text-sm leading-normal text-zinc-900 shadow-sm ring-zinc-200 placeholder:text-zinc-400 focus:border-forest focus:outline-hidden focus:ring-2 focus:ring-forest/25 dark:border-night-700 dark:bg-night-950 dark:text-zinc-50 dark:ring-night-800 ${search ? 'pr-11' : 'pr-4'}`}
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
            <FilterPopover
              fields={userFilterFields}
              values={userFilters}
              defaultValues={USER_FILTER_DEFAULTS}
              onApply={(v) => setUserFilters(v as typeof USER_FILTER_DEFAULTS)}
              onClear={() => setUserFilters(USER_FILTER_DEFAULTS)}
            />
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
                className="no-scrollbar shrink-0 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 dark:border-blue-500/15"
              >
                <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-sm">
                  <UsersTableColgroup />
                  <thead className="bg-slate-100/92 backdrop-blur-md dark:bg-admin-elevated/95 dark:backdrop-blur-md">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="w-10 px-2 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        #
                      </th>
                      <SortHeader
                        label="Nombre"
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
                <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-sm">
                  <UsersTableColgroup />
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={NUM_DATA_COLS + 1}
                          className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          {users.length === 0
                            ? 'No hay usuarios registrados.'
                            : 'Ningún usuario coincide con la búsqueda.'}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((u, idx) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-200/55 transition-colors last:border-0 hover:bg-slate-50/90 dark:border-blue-500/10 dark:hover:bg-white/6"
                        >
                          <td className="w-10 px-2 py-2 text-center align-middle tabular-nums text-slate-400 dark:text-slate-500">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <p className="font-medium leading-tight text-slate-900 dark:text-slate-100">
                              {fullName(u) || <TableEmptyCell />}
                            </p>
                          </td>
                          <td className="min-w-0 truncate px-4 py-2 align-middle text-slate-700 dark:text-slate-300">
                            {u.email}
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <AdminStatusBadge
                              tone="blue"
                              className="px-2.5! py-0.5! text-[11px]!"
                            >
                              {u.role}
                            </AdminStatusBadge>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <AdminStatusBadge tone={u.isActive ? 'success' : 'danger'}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </AdminStatusBadge>
                          </td>
                          <td className="px-4 py-2 align-middle text-center">
                            <div className="flex flex-nowrap items-center justify-center gap-1.5">
                              <Button
                                type="button"
                                variant="icon"
                                className={adminEditIconButtonClass}
                                aria-label={`Editar ${u.email}`}
                                disabled={busy}
                                onClick={() => setEditUserId(u.id)}
                              >
                                <FiEdit2 className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="icon"
                                className="text-red-600! hover:bg-red-500/10 dark:text-red-400! dark:hover:bg-red-950/35"
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

            <TablePagination
              totalItems={filteredSorted.length}
              page={page}
              pageSize={pageSize}
      totalPages={totalPages}
        onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>

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
                className="h-10 w-40 justify-center border-0 bg-rose-700/90 px-4 text-sm text-white hover:bg-rose-800 dark:bg-rose-700/90 dark:text-white dark:hover:bg-rose-800"
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
