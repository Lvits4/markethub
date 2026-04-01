import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { FormSelect } from './FormSelect';
import { ProductImagesField } from './ProductImagesField';
import { StepperNumberInput } from './StepperNumberInput';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useCreateProductMutation } from '../../hooks/useProductSellerMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useAdminStoresQuery } from '../../queries/useAdminStoresQuery';
import { uploadFile } from '../../requests/fileRequests';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const textareaClass = `${fieldClass} resize-none`;

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const STEPS = [
  { title: 'Tienda y datos básicos' },
  { title: 'Precio, stock e imágenes' },
] as const;

export type CreateProductFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormErrors = {
  storeId?: string;
  name?: string;
  price?: string;
  stock?: string;
};

export function CreateProductForm({
  onSuccess,
  onCancel,
}: CreateProductFormProps) {
  const { token } = useAuth();
  const { data: stores } = useAdminStoresQuery();
  const { data: categories } = useCategoriesFlatQuery();

  const [step, setStep] = useState(0);
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const createMut = useCreateProductMutation(storeId || undefined);

  const lastIndex = STEPS.length - 1;

  const storeOptions = useMemo(() => {
    const list = Array.isArray(stores) ? stores : [];
    return [
      { value: '', label: '— Selecciona una tienda —' },
      ...list.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [stores]);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: '— Sin categoría —' },
      ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const reset = () => {
    setStep(0);
    setStoreId('');
    setName('');
    setDescription('');
    setPrice('');
    setStock('0');
    setCategoryId('');
    setImageFiles([]);
    setIsUploadingImages(false);
    setErrors({});
  };

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const next: FormErrors = {};
      if (!storeId) next.storeId = 'Selecciona una tienda.';
      if (!name.trim()) next.name = 'El nombre es obligatorio.';
      setErrors((prev) => ({ ...prev, ...next }));
      return Object.keys(next).length === 0;
    }
    if (index === 1) {
      const next: FormErrors = {};
      const pr = Number.parseFloat(price.replace(',', '.'));
      const st = Number.parseInt(stock, 10);
      if (!Number.isFinite(pr) || pr < 0) next.price = 'Precio inválido.';
      if (!Number.isFinite(st) || st < 0) next.stock = 'Stock inválido.';
      setErrors((prev) => ({ ...prev, ...next }));
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, lastIndex));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleCreate = async () => {
    if (!validateStep(0)) {
      setStep(0);
      return;
    }
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    const n = name.trim();
    const pr = Number.parseFloat(price.replace(',', '.'));
    const st = Number.parseInt(stock, 10);

    let imagePayload: { url: string; sortOrder: number }[] | undefined =
      undefined;

    if (imageFiles.length > 0) {
      if (!token) {
        toast.error('No hay sesión para subir imágenes.');
        return;
      }
      setIsUploadingImages(true);
      const urls: string[] = [];
      try {
        for (const file of imageFiles) {
          const res = await uploadFile(token, file, 'products');
          urls.push(res.url);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        setIsUploadingImages(false);
        return;
      }
      setIsUploadingImages(false);
      imagePayload = urls.map((url, i) => ({ url, sortOrder: i }));
    }

    createMut.mutate(
      {
        name: n,
        description: description.trim() || undefined,
        price: pr,
        stock: st,
        storeId,
        categoryId: categoryId || undefined,
        images: imagePayload,
      },
      {
        onSuccess: () => {
          toast.success('Producto creado');
          reset();
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const disabledNav = createMut.isPending || isUploadingImages;
  const errorFieldClass =
    'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div className="market-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        <div className="mb-4 flex flex-col gap-2">
          <div
            className="flex gap-1.5"
            role="list"
            aria-label="Progreso del formulario"
          >
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
                <label htmlFor="create-product-store" className={labelClass}>
                  Tienda{' '}
                  <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <FormSelect
                  id="create-product-store"
                  value={storeId}
                  onChange={(v) => {
                    setStoreId(v);
                    setErrors((prev) => ({ ...prev, storeId: undefined }));
                  }}
                  options={storeOptions}
                  placeholder="— Selecciona una tienda —"
                  error={Boolean(errors.storeId)}
                />
                {errors.storeId ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.storeId}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="create-product-name" className={labelClass}>
                  Nombre{' '}
                  <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="create-product-name"
                  placeholder="Ej. Camiseta deportiva"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`${fieldClass} ${errors.name ? errorFieldClass : ''}`}
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="create-product-description"
                  className={labelClass}
                >
                  Descripción
                </label>
                <textarea
                  id="create-product-description"
                  rows={3}
                  placeholder="Descripción del producto…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={textareaClass}
                />
              </div>
              <div>
                <label
                  htmlFor="create-product-category"
                  className={labelClass}
                >
                  Categoría
                </label>
                <FormSelect
                  id="create-product-category"
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categoryOptions}
                  placeholder="— Sin categoría —"
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="create-product-price"
                    className={labelClass}
                  >
                    Precio{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <StepperNumberInput
                    id="create-product-price"
                    mode="money"
                    step={0.01}
                    min={0}
                    placeholder="0.00"
                    value={price}
                    onChange={(v) => {
                      setPrice(v);
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    error={Boolean(errors.price)}
                    disabled={disabledNav}
                  />
                  {errors.price ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.price}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="create-product-stock"
                    className={labelClass}
                  >
                    Stock{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <StepperNumberInput
                    id="create-product-stock"
                    mode="int"
                    step={1}
                    min={0}
                    placeholder="0"
                    value={stock}
                    onChange={(v) => {
                      setStock(v);
                      setErrors((prev) => ({ ...prev, stock: undefined }));
                    }}
                    error={Boolean(errors.stock)}
                    disabled={disabledNav}
                  />
                  {errors.stock ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.stock}
                    </p>
                  ) : null}
                </div>
              </div>
              <div>
                <label
                  htmlFor="create-product-images"
                  className={labelClass}
                >
                  Imágenes
                </label>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Opcional. Se suben al pulsar «Crear producto».
                </p>
                <div className="mt-2">
                  <ProductImagesField
                    id="create-product-images"
                    files={imageFiles}
                    onChange={setImageFiles}
                    disabled={disabledNav || !token}
                  />
                </div>
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
              variant="cta"
              disabled={disabledNav}
              onClick={goNext}
              className="h-11 min-h-11 inline-flex min-w-0 flex-1 items-center justify-center gap-1 px-3 sm:min-w-[11rem]"
            >
              Siguiente
              <FiChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              disabled={disabledNav}
              onClick={() => void handleCreate()}
              className="h-11 min-h-11 min-w-0 flex-1 justify-center px-3 sm:min-w-[11rem]"
            >
              {isUploadingImages
                ? 'Subiendo imágenes…'
                : createMut.isPending
                  ? 'Creando…'
                  : 'Crear producto'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
