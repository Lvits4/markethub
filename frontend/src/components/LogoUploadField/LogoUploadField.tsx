import { useId, useRef, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { uploadFile } from '../../requests/fileRequests';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

function truncateUrl(url: string) {
  return url.length > 48 ? `${url.slice(0, 22)}…${url.slice(-20)}` : url;
}

type LogoUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** Carpeta en el backend (p. ej. stores) */
  uploadFolder?: string;
  /** Si es false, solo selecciona; no sube automáticamente. */
  uploadOnSelect?: boolean;
  /** Archivo seleccionado cuando uploadOnSelect es false. */
  onFileChange?: (file: File | null) => void;
  selectedFile?: File | null;
  onUploadingChange?: (uploading: boolean) => void;
};

export function LogoUploadField({
  value,
  onChange,
  disabled = false,
  uploadFolder = 'stores',
  uploadOnSelect = true,
  onFileChange,
  selectedFile,
  onUploadingChange,
}: LogoUploadFieldProps) {
  const { token } = useAuth();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);

  const uploadSelectedFile = async (file: File) => {
    if (!token) {
      toast.error('Inicia sesión para subir archivos');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const res = await uploadFile(token, file, uploadFolder);
      onChange(res.url);
      toast.success('Imagen subida');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    if (!uploadOnSelect) {
      onFileChange?.(file);
      return;
    }
    await uploadSelectedFile(file);
  };

  const processDroppedOrPicked = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    if (!uploadOnSelect) {
      onFileChange?.(file);
      return;
    }
    void uploadSelectedFile(file);
  };

  const busy = disabled || uploading;
  const hasPendingFile = Boolean(selectedFile);
  const hasSavedUrl = Boolean(value.trim());
  const zoneClass = `flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
    busy || !token
      ? 'cursor-not-allowed border-zinc-200 bg-zinc-50/40 opacity-50 dark:border-night-700 dark:bg-night-950/30'
      : dragOver
        ? 'cursor-pointer border-[#1f6feb] bg-blue-50/80 dark:border-sky-400 dark:bg-sky-500/10'
        : 'cursor-pointer border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-100/80 dark:border-night-600 dark:bg-night-950/40 dark:hover:border-sky-500/35 dark:hover:bg-night-900/60'
  }`;

  const listRowClass =
    'flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-night-600 dark:bg-night-900/60';

  const fileInputId = `${inputId}-logo-file`;

  const zoneBody = (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200/90 text-zinc-600 transition-colors group-hover:bg-zinc-300/90 dark:bg-night-700 dark:text-sky-300/90 dark:group-hover:bg-night-600">
        {uploading ? (
          <FiUpload className="h-6 w-6 animate-pulse" aria-hidden />
        ) : dragOver ? (
          <FiUpload className="h-6 w-6" aria-hidden />
        ) : (
          <FiImage className="h-6 w-6" aria-hidden />
        )}
      </span>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {uploading ? (
          'Subiendo…'
        ) : (
          <>
            Arrastra una imagen aquí o{' '}
            <span className="text-[var(--color-forest)] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-current dark:text-sky-400">
              elige archivo
            </span>
          </>
        )}
      </span>
      <span className="max-w-xs text-xs text-zinc-500 dark:text-zinc-500">
        PNG, JPG, WebP…
      </span>
    </>
  );

  return (
    <div className="space-y-3">
      <p id={`${inputId}-label`} className={labelClass}>
        Logo de la tienda
      </p>
      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-labelledby={`${inputId}-label`}
        disabled={busy || !token}
        onChange={(e) => void handleFile(e)}
      />

      {busy || !token ? (
        <div className={`group ${zoneClass}`}>{zoneBody}</div>
      ) : (
        <label
          htmlFor={fileInputId}
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
            processDroppedOrPicked(e.dataTransfer.files?.[0]);
          }}
        >
          {zoneBody}
        </label>
      )}

      {hasPendingFile ? (
        <ul className="space-y-2">
          <li className={listRowClass}>
            <span
              className="min-w-0 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200"
              title={selectedFile!.name}
            >
              {selectedFile!.name}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onFileChange?.(null);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-50 dark:hover:bg-night-700 dark:hover:text-zinc-200"
              aria-label="Quitar imagen seleccionada"
            >
              <FiX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </li>
        </ul>
      ) : null}

      {!hasPendingFile && hasSavedUrl ? (
        <ul className="space-y-2">
          <li className={listRowClass}>
            <span className="min-w-0 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                Imagen actual:{' '}
              </span>
              <span className="font-mono" title={value.trim()}>
                {truncateUrl(value.trim())}
              </span>
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-50 dark:hover:bg-night-700 dark:hover:text-zinc-200"
              aria-label="Quitar imagen"
            >
              <FiX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
