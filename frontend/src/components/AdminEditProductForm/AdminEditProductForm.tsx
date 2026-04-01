import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { FormSelect } from '../CreateProductForm/FormSelect';
import { ProductImagesField } from '../CreateProductForm/ProductImagesField';
import { StepperNumberInput } from '../CreateProductForm/StepperNumberInput';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProductMutation } from '../../hooks/useProductSellerMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { uploadFile } from '../../requests/fileRequests';
import type { Product } from '../../types/product';

const fieldClass =
  'mt-0.5 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/20 dark:border-night-700 dark:bg-night-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const textareaClass = `${fieldClass} resize-none`;

const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-300';

const errorFieldClass =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

const STEPS = [
  { title: 'Datos básicos' },
  { title: 'Precio, stock e imágenes' },
] as const;

type FormErrors = {
  name?: string;
  price?: string;
  stock?: string;
};

export type AdminEditProductFormProps = {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AdminEditProductForm({
  product,
  onSuccess,
  onCancel,
}: AdminEditProductFormProps) {
  const { token } = useAuth();
  const updateMut = useUpdateProductMutation(product.storeId);
  const { data: categories } = useCategoriesFlatQuery();

  const lastIndex = STEPS.length - 1;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? '');
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [remoteImageUrls, setRemoteImageUrls] = useState<string[]>(
    product.images?.map((i) => i.url).filter(Boolean) ?? [],
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const categoryOptions = useMemo(
    () => [
      { value: '', label: '— Sin categoría —' },
      ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const next: FormErrors = {};
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

  const submit = async () => {
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

    const finalUrls = [...remoteImageUrls];

    if (newImageFiles.length > 0) {
      if (!token) {
        toast.error('No hay sesión para subir imágenes.');
        return;
      }
      setIsUploadingImages(true);
      try {
        for (const file of newImageFiles) {
          const res = await uploadFile(token, file, 'products');
          finalUrls.push(res.url);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
        setIsUploadingImages(false);
        return;
      }
      setIsUploadingImages(false);
    }

    const images =
      finalUrls.length > 0
        ? finalUrls.map((url, i) => ({ url, sortOrder: i }))
        : undefined;

    updateMut.mutate(
      {
        id: product.id,
        body: {
          name: n,
          description: description.trim() || undefined,
          price: pr,
          stock: st,
          categoryId: categoryId || undefined,
          images,
        },
      },
      {
        onSuccess: () => {
          toast.success('Producto actualizado');
          onSuccess?.();
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    );
  };

  const disabledNav = updateMut.isPending || isUploadingImages;

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
                <label htmlFor="edit-product-name" className={labelClass}>
                  Nombre{' '}
                  <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                  id="edit-product-name"
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
                <label htmlFor="edit-product-description" className={labelClass}>
                  Descripción
                </label>
                <textarea
                  id="edit-product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="edit-product-category" className={labelClass}>
                  Categoría
                </label>
                <FormSelect
                  id="edit-product-category"
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
                  <label htmlFor="edit-product-price" className={labelClass}>
                    Precio{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <StepperNumberInput
                    id="edit-product-price"
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
                  <label htmlFor="edit-product-stock" className={labelClass}>
                    Stock{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <StepperNumberInput
                    id="edit-product-stock"
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
                <label htmlFor="edit-product-images" className={labelClass}>
                  Imágenes
                </label>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Las nuevas se suben al pulsar «Actualizar». Puedes quitar las
                  actuales o añadir más.
                </p>
                <div className="mt-2">
                  <ProductImagesField
                    id="edit-product-images"
                    files={newImageFiles}
                    onChange={setNewImageFiles}
                    remoteUrls={remoteImageUrls}
                    onRemoveRemote={(url) =>
                      setRemoteImageUrls((prev) => prev.filter((x) => x !== url))
                    }
                    protectedImageToken={token}
                    hintText="PNG, JPG, WebP… Las nuevas se suben al guardar."
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
              onClick={() => void submit()}
              className="h-11 min-h-11 min-w-0 flex-1 justify-center border-0 px-3 text-sm !bg-[#102251] !text-[#458bde] shadow-sm hover:!bg-[#152a5e] focus-visible:!ring-2 focus-visible:!ring-[#458bde]/35 dark:!bg-[#102251] dark:!text-[#458bde] dark:hover:!bg-[#152a5e] sm:min-w-[11rem]"
            >
              {isUploadingImages
                ? 'Subiendo imágenes…'
                : updateMut.isPending
                  ? 'Guardando…'
                  : 'Actualizar'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
