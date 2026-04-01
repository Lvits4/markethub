import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { LogoUploadField } from '../LogoUploadField/LogoUploadField';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useCreateStoreMutation } from '../../hooks/useStoreMutations';
import { uploadFile } from '../../requests/fileRequests';
import type { CreateStorePayload } from '../../requests/storeRequests';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const textareaClass = `${fieldClass} resize-none`;

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const STEPS = [
  { title: 'Identidad y presentación' },
  { title: 'Contacto y políticas' },
] as const;

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export type CreateStoreFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type CreateStoreFormErrors = {
  name?: string;
  contactEmail?: string;
};

export function CreateStoreForm({ onSuccess, onCancel }: CreateStoreFormProps) {
  const { token } = useAuth();
  const createMut = useCreateStoreMutation();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [errors, setErrors] = useState<CreateStoreFormErrors>({});

  const lastIndex = STEPS.length - 1;

  const reset = () => {
    setStep(0);
    setName('');
    setDescription('');
    setLogo('');
    setShippingPolicy('');
    setReturnPolicy('');
    setContactEmail('');
    setContactPhone('');
    setSelectedLogoFile(null);
    setLogoUploading(false);
    setErrors({});
  };

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const nextErrors: CreateStoreFormErrors = {};
      if (!name.trim()) {
        nextErrors.name = 'El nombre es obligatorio.';
      }
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }

    if (index === 1) {
      const nextErrors: CreateStoreFormErrors = {};
      const emailTrim = contactEmail.trim();
      if (emailTrim && !isValidEmail(emailTrim)) {
        nextErrors.contactEmail = 'Introduce un correo válido.';
      }
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return Object.keys(nextErrors).length === 0;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, lastIndex));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleCreateStore = async () => {
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

    const body: CreateStorePayload = { name: n };
    const d = description.trim();
    if (d) body.description = d;
    const l = logoUrl;
    if (l) body.logo = l;
    const sp = shippingPolicy.trim();
    if (sp) body.shippingPolicy = sp;
    const rp = returnPolicy.trim();
    if (rp) body.returnPolicy = rp;
    if (emailTrim) body.contactEmail = emailTrim;
    const ph = contactPhone.trim();
    if (ph) body.contactPhone = ph;

    createMut.mutate(body, {
      onSuccess: () => {
        toast.success('Tienda creada');
        reset();
        onSuccess?.();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const disabledNav = createMut.isPending || logoUploading;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-1.5" role="list" aria-label="Progreso del formulario">
            {STEPS.map((_, i) => (
              <div
                key={i}
                role="listitem"
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step
                    ? 'bg-[var(--color-forest)] dark:bg-blue-500'
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
                <label htmlFor="create-store-name" className={labelClass}>
                  Nombre <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="create-store-name"
                  autoComplete="organization"
                  placeholder="Ej. Mi tienda online"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`${fieldClass} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20' : ''}`}
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="create-store-description" className={labelClass}>
                  Descripción
                </label>
                <textarea
                  id="create-store-description"
                  rows={3}
                  placeholder="Qué vendes, para quién…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={textareaClass}
                />
              </div>
              <LogoUploadField
                value={logo}
                onChange={setLogo}
                disabled={createMut.isPending}
                uploadOnSelect={false}
                onFileChange={setSelectedLogoFile}
                selectedFile={selectedLogoFile}
                onUploadingChange={setLogoUploading}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div>
                <label htmlFor="create-store-email" className={labelClass}>
                  Correo de contacto
                </label>
                <input
                  id="create-store-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tienda@ejemplo.com"
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
              </div>
              <div>
                <label htmlFor="create-store-phone" className={labelClass}>
                  Teléfono de contacto
                </label>
                <input
                  id="create-store-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+34 …"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="create-store-shipping" className={labelClass}>
                  Política de envíos
                </label>
                <textarea
                  id="create-store-shipping"
                  rows={2}
                  placeholder="Plazos, costes, zonas…"
                  value={shippingPolicy}
                  onChange={(e) => setShippingPolicy(e.target.value)}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="create-store-returns" className={labelClass}>
                  Política de devoluciones
                </label>
                <textarea
                  id="create-store-returns"
                  rows={2}
                  placeholder="Plazo, condiciones…"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className={textareaClass}
                />
              </div>
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
              disabled={disabledNav}
              onClick={onCancel}
              className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:min-w-[7.5rem]"
            >
              Cancelar
            </Button>
          ) : null}
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabledNav}
              onClick={goBack}
              className="h-11 min-h-11 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700 sm:flex-none sm:min-w-[7.5rem]"
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
              variant="primary"
              disabled={disabledNav}
              onClick={goNext}
              className="h-11 min-h-11 inline-flex min-w-0 flex-1 items-center justify-center gap-1 border-0 px-3 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e] sm:min-w-[11rem]"
            >
              Siguiente
              <FiChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={disabledNav}
              onClick={() => void handleCreateStore()}
              className="h-11 min-h-11 min-w-0 flex-1 justify-center border-0 px-3 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e] sm:min-w-[11rem]"
            >
              {createMut.isPending ? 'Creando…' : 'Crear tienda'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
