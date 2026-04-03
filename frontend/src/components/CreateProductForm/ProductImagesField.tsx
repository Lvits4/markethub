import { useRef, useState } from 'react';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';

const DEFAULT_HINT =
  'PNG, JPG, WebP… Se subirán al guardar el formulario.';

function truncateUrl(url: string) {
  return url.length > 48 ? `${url.slice(0, 22)}…${url.slice(-20)}` : url;
}

export type ProductImagesFieldProps = {
  /** Mismo `id` que `htmlFor` del `<label>` del formulario. */
  id: string;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  /** URLs ya persistidas (formulario de edición). */
  remoteUrls?: string[];
  onRemoveRemote?: (url: string) => void;
  /** Reservado por compatibilidad con formularios existentes; no se usa en la UI. */
  protectedImageToken?: string | null;
  /** Texto bajo la zona de soltar archivos. */
  hintText?: string;
  /** Si es false, solo se admite una imagen local (sustituye la anterior). */
  multiple?: boolean;
  /** Zona de soltar más baja (p. ej. panel lateral de ajustes). */
  compact?: boolean;
  /**
   * Si se define, cada selección o drop invoca esto y **no** actualiza `files` vía `onChange`.
   * Útil para subida inmediata (p. ej. formulario vendedor).
   */
  onPickFiles?: (files: File[]) => void | Promise<void>;
};

function filterImageFiles(list: FileList | File[]): File[] {
  return [...list].filter((f) => f.type.startsWith('image/'));
}

export function ProductImagesField({
  id,
  files,
  onChange,
  disabled = false,
  remoteUrls,
  onRemoveRemote,
  hintText,
  multiple = true,
  onPickFiles,
  compact = false,
}: ProductImagesFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);

  const addFiles = (list: FileList | File[]) => {
    if (disabled) return;
    const incoming = filterImageFiles(list);
    if (incoming.length === 0) return;
    if (onPickFiles) {
      void Promise.resolve(onPickFiles(multiple ? incoming : [incoming[0]]));
      return;
    }
    if (!multiple) {
      onChange([incoming[0]]);
      return;
    }
    onChange([...files, ...incoming]);
  };

  const removeAt = (index: number) => {
    if (disabled) return;
    onChange(files.filter((_, i) => i !== index));
  };

  const zoneClass = `flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition-colors ${
    compact ? 'gap-1 px-3 py-3' : 'gap-2 px-4 py-8'
  } ${
    disabled
      ? 'cursor-not-allowed border-zinc-200 bg-zinc-50/40 opacity-50 dark:border-night-700 dark:bg-night-950/30'
      : dragOver
        ? 'cursor-pointer border-[#1f6feb] bg-blue-50/80 dark:border-sky-400 dark:bg-sky-500/10'
        : 'cursor-pointer border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-100/80 dark:border-night-600 dark:bg-night-950/40 dark:hover:border-sky-500/35 dark:hover:bg-night-900/60'
  }`;

  const body = (
    <>
      <span
        className={`flex items-center justify-center rounded-full bg-zinc-200/90 text-zinc-600 transition-colors group-hover:bg-zinc-300/90 dark:bg-night-700 dark:text-sky-300/90 dark:group-hover:bg-night-600 ${
          compact ? 'h-9 w-9' : 'h-12 w-12'
        }`}
      >
        {dragOver ? (
          <FiUpload
            className={compact ? 'h-5 w-5' : 'h-6 w-6'}
            aria-hidden
          />
        ) : (
          <FiImage
            className={compact ? 'h-5 w-5' : 'h-6 w-6'}
            aria-hidden
          />
        )}
      </span>
      <span
        className={`font-medium text-zinc-700 dark:text-zinc-200 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        Arrastra imágenes aquí o{' '}
        <span className="text-[var(--color-forest)] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current">
          elige archivos
        </span>
      </span>
      <span
        className={`max-w-xs text-zinc-500 dark:text-zinc-500 ${
          compact ? 'text-[11px] leading-snug' : 'text-xs'
        }`}
      >
        {hintText ?? DEFAULT_HINT}
      </span>
    </>
  );

  const listRowClass =
    'flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-night-600 dark:bg-night-900/60';

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const fl = e.target.files;
          if (fl?.length) addFiles(fl);
          e.target.value = '';
        }}
      />

      {disabled ? (
        <div className={`group ${zoneClass}`}>{body}</div>
      ) : (
        <label
          htmlFor={id}
          className={`group ${zoneClass}`}
          onDragEnter={(e) => {
            e.preventDefault();
            dragDepth.current += 1;
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragOver(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            dragDepth.current = 0;
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          {body}
        </label>
      )}

      {((remoteUrls?.length ?? 0) > 0 ||
        (!onPickFiles && files.length > 0)) && (
        <ul className="space-y-2">
          {(remoteUrls ?? []).map((u) => (
            <li key={u} className={listRowClass}>
              <span
                className="min-w-0 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400"
                title={u}
              >
                {truncateUrl(u)}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveRemote?.(u)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-night-700 dark:hover:text-zinc-200"
                aria-label="Quitar imagen guardada"
              >
                <FiX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </button>
            </li>
          ))}
          {!onPickFiles
            ? files.map((file, i) => (
                <li
                  key={`${file.name}-${file.lastModified}-${i}`}
                  className={listRowClass}
                >
                  <span
                    className="min-w-0 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200"
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeAt(i)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-night-700 dark:hover:text-zinc-200"
                    aria-label={`Quitar ${file.name}`}
                  >
                    <FiX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  </button>
                </li>
              ))
            : null}
        </ul>
      )}
    </div>
  );
}
