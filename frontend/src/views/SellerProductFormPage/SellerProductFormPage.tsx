import { useEffect, useId, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { FormSelect } from '../../components/CreateProductForm/FormSelect';
import { ProductImagesField } from '../../components/CreateProductForm/ProductImagesField';
import { routePaths } from '../../config/routes';
import { getErrorMessage } from '../../helpers/mapApiError';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../hooks/useProductSellerMutations';
import { useCategoriesFlatQuery } from '../../queries/useCategoriesFlatQuery';
import { useProductByIdQuery } from '../../queries/useProductByIdQuery';
import { uploadFile } from '../../requests/fileRequests';

export function SellerProductFormPage() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(productId);

  const storeIdParam = searchParams.get('storeId') ?? '';
  const { data: categories } = useCategoriesFlatQuery();
  const { data: existing, isLoading: loadingProduct } = useProductByIdQuery(
    isEdit ? productId : undefined,
  );

  const effectiveStoreId = isEdit ? existing?.storeId : storeIdParam;
  const createMut = useCreateProductMutation(
    effectiveStoreId || undefined,
  );
  const updateMut = useUpdateProductMutation(
    existing?.storeId ?? (effectiveStoreId || undefined),
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const productImagesFieldId = useId();

  const categoryOptions = useMemo(
    () => [
      { value: '', label: '—' },
      ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setDescription(existing.description ?? '');
    setPrice(String(existing.price));
    setStock(String(existing.stock));
    setCategoryId(existing.categoryId ?? '');
    const urls =
      existing.images?.map((i) => i.url).filter(Boolean) ?? [];
    setImageUrls(urls);
  }, [existing]);

  const handlePickFiles = async (picked: File[]) => {
    if (!token) {
      toast.error('Inicia sesión para subir archivos');
      return;
    }
    setUploading(true);
    try {
      for (const file of picked) {
        const res = await uploadFile(token, file, 'products');
        setImageUrls((prev) => [...prev, res.url]);
      }
      toast.success(
        picked.length === 1
          ? 'Imagen subida'
          : `${picked.length} imágenes subidas`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    const n = name.trim();
    const pr = Number.parseFloat(price.replace(',', '.'));
    const st = Number.parseInt(stock, 10);
    if (!n) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(pr) || pr < 0) {
      toast.error('Precio inválido');
      return;
    }
    if (!Number.isFinite(st) || st < 0) {
      toast.error('Stock inválido');
      return;
    }
    const sid = isEdit ? existing?.storeId : storeIdParam;
    if (!sid) {
      toast.error('Falta la tienda (vuelve desde la lista de productos de una tienda)');
      return;
    }

    const images =
      imageUrls.length > 0
        ? imageUrls.map((url, i) => ({ url, sortOrder: i }))
        : undefined;

    if (isEdit && productId) {
      updateMut.mutate(
        {
          id: productId,
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
            navigate(routePaths.sellerStoreProducts(sid));
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    } else {
      createMut.mutate(
        {
          name: n,
          description: description.trim() || undefined,
          price: pr,
          stock: st,
          storeId: sid,
          categoryId: categoryId || undefined,
          images,
        },
        {
          onSuccess: () => {
            toast.success('Producto creado');
            navigate(routePaths.sellerStoreProducts(sid));
          },
          onError: (e) => toast.error(getErrorMessage(e)),
        },
      );
    }
  };

  if (isEdit && loadingProduct) {
    return (
      <p className="text-center text-sm text-zinc-500">Cargando producto…</p>
    );
  }

  if (isEdit && !existing) {
    return (
      <p className="text-center text-sm text-red-600">
        Producto no encontrado.{' '}
        <Link to={routePaths.seller} className="font-semibold underline">
          Volver
        </Link>
      </p>
    );
  }

  if (!isEdit && !storeIdParam) {
    return (
      <p className="text-center text-sm text-zinc-600">
        Abre “Nuevo producto” desde una tienda.{' '}
        <Link
          to={routePaths.seller}
          className="font-semibold text-[var(--color-forest)]"
        >
          Ir al panel vendedor
        </Link>
      </p>
    );
  }

  const backHref =
    effectiveStoreId != null && effectiveStoreId !== ''
      ? routePaths.sellerStoreProducts(effectiveStoreId)
      : routePaths.seller;

  return (
    <div>
      <div className="mb-6">
        <Link
          to={backHref}
          className="text-sm font-medium text-[var(--color-forest)] dark:text-blue-400"
        >
          ← Volver
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      <div className="mt-6 max-w-xl space-y-4 rounded-md bg-white p-6 shadow-[var(--shadow-market)] ring-1 ring-zinc-200/70 dark:bg-night-900 dark:ring-night-800">
        <div>
          <label className="text-xs text-zinc-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-500">Precio</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-night-700 dark:bg-night-950"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="seller-product-category"
            className="text-xs text-zinc-500"
          >
            Categoría
          </label>
          <FormSelect
            id="seller-product-category"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
            placeholder="—"
            triggerClassName="!mt-1"
          />
        </div>
        <div>
          <label
            htmlFor={productImagesFieldId}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            Imágenes
          </label>
          <div className="mt-1">
            <ProductImagesField
              id={productImagesFieldId}
              files={[]}
              onChange={() => {}}
              remoteUrls={imageUrls}
              onRemoveRemote={(u) =>
                setImageUrls((prev) => prev.filter((x) => x !== u))
              }
              disabled={uploading || !token}
              onPickFiles={handlePickFiles}
              hintText="PNG, JPG, WebP… Se suben al elegir o soltar archivos."
            />
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full justify-center"
          disabled={createMut.isPending || updateMut.isPending}
          onClick={submit}
        >
          {createMut.isPending || updateMut.isPending
            ? 'Guardando…'
            : isEdit
              ? 'Actualizar'
              : 'Crear'}
        </Button>
      </div>
    </div>
  );
}
