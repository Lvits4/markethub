import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';

export type ProductImagesFieldProps = {
  /** Mismo `id` que `htmlFor` del `<label>` del formulario. */
  id: string;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

function filterImageFiles(list: FileList | File[]): File[] {
  return [...list].filter((f) => f.type.startsWith('image/'));
}

export function ProductImagesField({
  id,
  files,
  onChange,
  disabled = false,
}: ProductImagesFieldProps) {
  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);

  useLayoutEffect(() => {
    const urls = previewUrls;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const addFiles = (list: FileList | File[]) => {
    if (disabled) return;
    const incoming = filterImageFiles(list);
    if (incoming.length === 0) return;
    onChange([...files, ...incoming]);
  };

  const removeAt = (index: number) => {
    if (disabled) return;
    onChange(files.filter((_, i) => i !== index));
  };

  const zoneClass = `flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
    disabled
      ? 'cursor-not-allowed border-zinc-200 bg-zinc-50/40 opacity-50 dark:border-night-700 dark:bg-night-950/30'
      : dragOver
        ? 'cursor-pointer border-[#1f6feb] bg-blue-50/80 dark:border-sky-400 dark:bg-sky-500/10'
        : 'cursor-pointer border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-100/80 dark:border-night-600 dark:bg-night-950/40 dark:hover:border-sky-500/35 dark:hover:bg-night-900/60'
  }`;

  const body = (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200/90 text-zinc-600 transition-colors group-hover:bg-zinc-300/90 dark:bg-night-700 dark:text-sky-300/90 dark:group-hover:bg-night-600">
        {dragOver ? (
          <FiUpload className="h-6 w-6" aria-hidden />
        ) : (
          <FiImage className="h-6 w-6" aria-hidden />
        )}
      </span>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Arrastra imágenes aquí o{' '}
        <span className="text-[var(--color-forest)] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current dark:text-sky-400">
          elige archivos
        </span>
      </span>
      <span className="max-w-xs text-xs text-zinc-500 dark:text-zinc-500">
        PNG, JPG, WebP… Se subirán al crear el producto.
      </span>
    </>
  );

  return (
    <div className="space-y-3">
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
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

      {files.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.lastModified}-${i}`}
              className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-night-600 dark:bg-night-800"
            >
              <img
                src={previewUrls[i]}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:pointer-events-none disabled:opacity-50"
                aria-label={`Quitar ${file.name}`}
              >
                <FiX className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <p className="absolute bottom-0 left-0 right-0 truncate bg-black/45 px-1.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                {file.name}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
