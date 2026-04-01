import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useProtectedImageSrc } from '../../hooks/useProtectedImageSrc';
import { uploadFile } from '../../requests/fileRequests';

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

type LogoUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  /** Carpeta en el backend (p. ej. stores) */
  uploadFolder?: string;
  /** Si es false, solo selecciona y previsualiza; no sube automáticamente. */
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
  const [previewUrl, setPreviewUrl] = useState('');
  const { src: valueSrc, loading: valueLoading } = useProtectedImageSrc(
    value,
    token,
  );

  const clearPreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (uploadOnSelect) return;
    if (!selectedFile) {
      clearPreview();
      return;
    }
    clearPreview();
    const next = URL.createObjectURL(selectedFile);
    setPreviewUrl(next);
  }, [selectedFile, uploadOnSelect]);

  const setPreviewFromFile = (file: File) => {
    clearPreview();
    const next = URL.createObjectURL(file);
    setPreviewUrl(next);
  };

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
      setPreviewFromFile(file);
      onFileChange?.(file);
      return;
    }
    await uploadSelectedFile(file);
  };

  const busy = disabled || uploading;
  const hasValuePreview = Boolean(value.trim());
  const showPreviewSlot = hasValuePreview || Boolean(previewUrl);
  const imgSrc = previewUrl || valueSrc;

  return (
    <div>
      <p id={`${inputId}-label`} className={labelClass}>
        Logo de la tienda
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-labelledby={`${inputId}-label`}
        disabled={busy || !token}
        onChange={(e) => void handleFile(e)}
      />
      <div className="mt-0.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button
          type="button"
          disabled={busy || !token}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              toast.error('El archivo debe ser una imagen');
              return;
            }
            if (!uploadOnSelect) {
              setPreviewFromFile(file);
              onFileChange?.(file);
              return;
            }
            void uploadSelectedFile(file);
          }}
          className="flex h-[7rem] flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 transition hover:border-[var(--color-forest)] hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-night-600 dark:bg-night-950 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:bg-night-900"
        >
          {uploading ? (
            <span>Subiendo…</span>
          ) : (
            <>
              <FiUpload className="h-5 w-5 text-zinc-400 dark:text-zinc-500" aria-hidden />
              <span>
                {showPreviewSlot
                  ? 'Cambiar imagen'
                  : 'Haz clic o suelta una imagen aquí'}
              </span>
              <span className="text-[11px] text-zinc-400">PNG, JPG, WebP…</span>
            </>
          )}
        </button>
        {showPreviewSlot ? (
          <div className="relative flex h-[7rem] w-full shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-night-700 dark:bg-night-900 sm:w-[7rem]">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-xs text-zinc-500 dark:bg-night-950 dark:text-zinc-400">
                {valueLoading ? 'Cargando…' : 'Sin vista previa'}
              </div>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                clearPreview();
                onFileChange?.(null);
                onChange('');
              }}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900/75 text-white shadow-sm hover:bg-zinc-900 disabled:opacity-50"
              aria-label="Quitar imagen"
            >
              <FiX className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div
            className="flex h-[7rem] w-full shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 dark:border-night-700 dark:bg-night-950 sm:w-[7rem]"
            aria-hidden
          >
            <FiImage className="h-8 w-8 text-zinc-300 dark:text-night-600" />
          </div>
        )}
      </div>
    </div>
  );
}
