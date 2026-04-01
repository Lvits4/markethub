import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';
import { getErrorMessage } from '../../helpers/mapApiError';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../hooks/useNotificationMutations';
import {
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from '../../queries/useNotificationsQueries';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: list, isLoading } = useNotificationsQuery();
  const { data: unread = 0 } = useUnreadNotificationsCountQuery();
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex rounded-md p-2.5 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-night-800"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <FiBell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-md border border-zinc-200 bg-white py-2 shadow-xl dark:border-night-700 dark:bg-night-900">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-2 dark:border-night-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Notificaciones
            </span>
            <button
              type="button"
              className="text-xs font-medium text-[var(--color-forest)] dark:text-blue-400"
              disabled={markAll.isPending || unread === 0}
              onClick={() =>
                markAll.mutate(undefined, {
                  onSuccess: () => toast.success('Marcadas como leídas'),
                  onError: (e) => toast.error(getErrorMessage(e)),
                })
              }
            >
              Marcar todas
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <li className="px-3 py-4 text-center text-sm text-zinc-500">
                Cargando…
              </li>
            ) : !list?.length ? (
              <li className="px-3 py-4 text-center text-sm text-zinc-500">
                No hay notificaciones
              </li>
            ) : (
              list.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`w-full px-3 py-2.5 text-left text-sm transition hover:bg-zinc-50 dark:hover:bg-night-800/80 ${
                      n.isRead ? 'opacity-70' : 'bg-zinc-50/80 dark:bg-night-800/40'
                    }`}
                    onClick={() => {
                      if (!n.isRead) {
                        markOne.mutate(n.id, {
                          onError: (e) => toast.error(getErrorMessage(e)),
                        });
                      }
                    }}
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                      {n.message}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
