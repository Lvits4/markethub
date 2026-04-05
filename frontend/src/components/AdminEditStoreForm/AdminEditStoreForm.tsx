import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { LogoUploadField } from '../LogoUploadField/LogoUploadField';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useAdminPatchCommission } from '../../hooks/useAdminPatchCommission';
import { useUpdateStoreMutation } from '../../hooks/useStoreMutations';
import { uploadFile } from '../../requests/fileRequests';
import type { AdminStoreDetail } from '../../types/admin';
import type { UpdateStorePayload } from '../../requests/storeRequests';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-hidden transition placeholder:text-zinc-400 focus:border-forest focus:ring-2 focus:ring-forest/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const textareaClass = `${fieldClass} resize-none`;

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const STEPS = [
  { title: 'Datos de la tienda' },
  { title: 'Contacto, marca y políticas' },
] as const;

function numOrZero(v: string | number) {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export type AdminEditStoreFormProps = {
  store: AdminStoreDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Si es false (vendedor), no se muestra ni envía la comisión. */
  allowCommissionEdit?: boolean;
};

type AdminEditStoreFormErrors = {
  name?: string;
  commission?: string;
  contactEmail?: string;
};

export function AdminEditStoreForm({
  store,
  onSuccess,
  onCancel,
  allowCommissionEdit = true,
}: AdminEditStoreFormProps) {
  const { token } = useAuth();
  const updateMut = useUpdateStoreMutation();
  const patchCommission = useAdminPatchCommission();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description ?? '');
  const [logo, setLogo] = useState(store.logo ?? '');
  const [shippingPolicy, setShippingPolicy] = useState(
    store.shippingPolicy ?? '',
  );
  const [returnPolicy, setReturnPolicy] = useState(store.returnPolicy ?? '');
  const [contactEmail, setContactEmail] = useState(store.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(store.contactPhone ?? '');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [commission, setCommission] = useState(
    String(numOrZero(store.commission)),
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [errors, setErrors] = useState<AdminEditStoreFormErrors>({});

  const lastIndex = STEPS.length - 1;

  useEffect(() => {
    setStep(0);
    setName(store.name);
    setDescription(store.description ?? '');
    setLogo(store.logo ?? '');
    setShippingPolicy(store.shippingPolicy ?? '');
    setReturnPolicy(store.returnPolicy ?? '');
    setContactEmail(store.contactEmail ?? '');
    setContactPhone(store.contactPhone ?? '');
    setSelectedLogoFile(null);
    setCommission(String(numOrZero(store.commission)));
    setErrors({});
  }, [store]);

  const busy =
    updateMut.isPending || patchCommission.isPending || logoUploading;

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const nextErrors: AdminEditStoreFormErrors = {};
      if (!name.trim()) {
        nextErrors.name = 'El nombre es obligatorio.';
      }
      if (allowCommissionEdit) {
        const commRaw = commission.trim().replace(',', '.');
        const commNum = Number.parseFloat(commRaw);
        if (!Number.isFinite(commNum) || commNum < 0 || commNum > 100) {
          nextErrors.commission = 'La comisión debe ser un número entre 0 y 100.';
        }
      }
      setErrors((prev) => ({
        ...prev,
        name: nextErrors.name,
        commission: nextErrors.commission,
      }));
      return Object.keys(nextErrors).length === 0;
    }
    if (index === 1) {
      const nextErrors: AdminEditStoreFormErrors = {};
      const emailTrim = contactEmail.trim();
      if (emailTrim && !isValidEmail(emailTrim)) {
        nextErrors.contactEmail = 'Introduce un correo válido.';
      }
      setErrors((prev) => ({
        ...prev,
        contactEmail: nextErrors.contactEmail,
      }));
      return Object.keys(nextErrors).length === 0;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, lastIndex));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSaveStore = async () => {
    if (logoUploading) {
      toast.error('Espera a que termine la subida del logo');
      return;
    }
    if (!validateStep(0)) {
      setStep(0);
      return;
    }
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    const n = name.trim();
    const emailTrim = contactEmail.trim();

    const commRaw = commission.trim().replace(',', '.');
    const commNum = Number.parseFloat(commRaw);

    let logoUrl = logo.trim();
    if (selectedLogoFile) {
      if (!token) {
        toast.error('Inicia sesión para subir archivos');
        return;
      }
      setLogoUploading(true);
      try {
        const uploadRes = await uploadFile(token, selectedLogoFile, 'stores');
        logoUrl = uploadRes.url;
        setLogo(uploadRes.url);
      } catch (err) {
        toast.error(getErrorMessage(err));
        return;
      } finally {
        setLogoUploading(false);
      }
    }

    const body: UpdateStorePayload = { name: n };
    const d = description.trim();
    body.description = d || undefined;
    body.logo = logoUrl || undefined;
    const sp = shippingPolicy.trim();
    body.shippingPolicy = sp || undefined;
    const rp = returnPolicy.trim();
    body.returnPolicy = rp || undefined;
    body.contactEmail = emailTrim || undefined;
    const ph = contactPhone.trim();
    body.contactPhone = ph || undefined;

    try {
      await updateMut.mutateAsync({ id: store.id, body });
      if (allowCommissionEdit) {
        const prevComm = numOrZero(store.commission);
        if (commNum !== prevComm) {
          await patchCommission.mutateAsync({
            storeId: store.id,
            commission: commNum,
          });
        }
      }
      toast.success('Tienda actualizada');
      onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 max-h-[min(60vh,520px)] flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:max-h-[min(65vh,580px)]">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-1.5" role="list" aria-label="Progreso del formulario">
            {STEPS.map((_, i) => (
              <div
                key={i}
                role="listitem"
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step
                    ? 'bg-forest dark:bg-blue-500'
                    : 'bg-zinc-200 dark:bg-night-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Paso {step + 1} de {STEPS.length}: {STEPS[step].title}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {step === 0 ? (
            <>
              <div>
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>
                    Nombre <span className="text-red-600 dark:text-red-400">*</span>
                  </span>
                  <input
                    autoComplete="organization"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`${fieldClass} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20' : ''}`}
                  />
                </label>
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Slug actual:{' '}
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {store.slug}
                  </span>
                  . Si cambias el nombre, el slug se regenerará al guardar.
                </p>
              </div>

              <label className="flex flex-col gap-1">
                <span className={labelClass}>Descripción</span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={textareaClass}
                />
              </label>

              {allowCommissionEdit ? (
                <label className="flex flex-col gap-1">
                  <span className={labelClass}>Comisión (%)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={commission}
                    onChange={(e) => {
                      setCommission(e.target.value);
                      setErrors((prev) => ({ ...prev, commission: undefined }));
                    }}
                    className={`${fieldClass} ${errors.commission ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20' : ''}`}
                  />
                  {errors.commission ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.commission}
                    </p>
                  ) : null}
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Porcentaje de comisión de la plataforma (0–100).
                  </span>
                </label>
              ) : null}
            </>
          ) : null}

          {step === 1 ? (
            <>
              <label className="flex flex-col gap-1">
                <span className={labelClass}>Correo de contacto</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, contactEmail: undefined }));
                  }}
                  className={`${fieldClass} ${errors.contactEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20' : ''}`}
                />
                {errors.contactEmail ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.contactEmail}
                  </p>
                ) : null}
              </label>

              <label className="flex flex-col gap-1">
                <span className={labelClass}>Teléfono de contacto</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={fieldClass}
                />
              </label>

              <LogoUploadField
                value={logo}
                onChange={setLogo}
                disabled={busy}
                uploadOnSelect={false}
                onFileChange={setSelectedLogoFile}
                selectedFile={selectedLogoFile}
                onUploadingChange={setLogoUploading}
              />

              <label className="flex flex-col gap-1">
                <span className={labelClass}>Política de envíos</span>
                <textarea
                  rows={2}
                  value={shippingPolicy}
                  onChange={(e) => setShippingPolicy(e.target.value)}
                  className={textareaClass}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className={labelClass}>Política de devoluciones</span>
                <textarea
                  rows={2}
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className={textareaClass}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>

      <div
        className={`flex w-full shrink-0 flex-col gap-2 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 sm:flex-row sm:flex-wrap sm:items-center ${onCancel ? '' : 'sm:justify-end'}`}
      >
        <div
          className={`flex w-full gap-2 sm:w-auto ${onCancel ? 'sm:mr-auto' : ''}`}
        >
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={onCancel}
              className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:w-44"
            >
              Cancelar
            </Button>
          ) : null}
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={goBack}
              className="h-11 min-h-11 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:w-44"
            >
              <FiChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              Atrás
            </Button>
          ) : null}
        </div>
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto sm:flex-none">
          {step < lastIndex ? (
            <Button
              type="button"
              variant="cta"
              disabled={busy}
              onClick={goNext}
              className="h-11 min-h-11 inline-flex min-w-0 flex-1 items-center justify-center gap-1 px-3 sm:w-44 sm:flex-none"
            >
              Siguiente
              <FiChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              disabled={busy}
              onClick={handleSaveStore}
              className="h-11 min-h-11 min-w-0 flex-1 justify-center px-3 sm:w-44 sm:flex-none"
            >
              {busy ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
