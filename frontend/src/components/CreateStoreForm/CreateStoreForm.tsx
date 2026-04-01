import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../Button/Button';
import { LogoUploadField } from '../LogoUploadField/LogoUploadField';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useCreateStoreMutation } from '../../hooks/useStoreMutations';
import type { CreateStorePayload } from '../../requests/storeRequests';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const textareaClass = `${fieldClass} resize-none`;

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export type CreateStoreFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreateStoreForm({ onSuccess, onCancel }: CreateStoreFormProps) {
  const createMut = useCreateStoreMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setLogo('');
    setShippingPolicy('');
    setReturnPolicy('');
    setContactEmail('');
    setContactPhone('');
    setLogoUploading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (logoUploading) {
      toast.error('Espera a que termine la subida del logo');
      return;
    }
    const n = name.trim();
    if (!n) {
      toast.error('El nombre es obligatorio');
      return;
    }
    const emailTrim = contactEmail.trim();
    if (emailTrim && !isValidEmail(emailTrim)) {
      toast.error('Introduce un correo válido');
      return;
    }

    const body: CreateStorePayload = { name: n };
    const d = description.trim();
    if (d) body.description = d;
    const l = logo.trim();
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="create-store-name" className={labelClass}>
              Nombre <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="create-store-name"
              required
              autoComplete="organization"
              placeholder="Ej. Mi tienda online"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
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
              onChange={(e) => setContactEmail(e.target.value)}
              className={fieldClass}
            />
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

          <LogoUploadField
            value={logo}
            onChange={setLogo}
            disabled={createMut.isPending}
            onUploadingChange={setLogoUploading}
          />
        </div>
      </div>

      <div
        className={`flex w-full shrink-0 gap-3 border-t border-zinc-100 bg-zinc-50/90 px-5 py-4 dark:border-night-800 dark:bg-night-950/90 ${onCancel ? '' : 'justify-end'}`}
      >
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={createMut.isPending || logoUploading}
            onClick={onCancel}
            className="h-11 min-h-11 min-w-0 flex-1 basis-0 justify-center border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-night-600 dark:bg-night-800 dark:text-zinc-100 dark:hover:bg-night-700"
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={createMut.isPending || logoUploading}
          className={`h-11 min-h-11 justify-center border-0 px-3 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e] ${onCancel ? 'min-w-0 flex-1 basis-0' : 'min-w-[11rem]'}`}
        >
          {createMut.isPending ? 'Creando…' : 'Crear tienda'}
        </Button>
      </div>
    </form>
  );
}
