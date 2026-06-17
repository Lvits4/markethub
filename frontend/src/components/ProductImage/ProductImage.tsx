import { useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  showFallbackLabel?: boolean;
  loading?: 'lazy' | 'eager';
};

export function ProductImage({
  src,
  alt,
  className = '',
  imgClassName = 'h-full w-full object-cover',
  fallbackClassName = '',
  showFallbackLabel = true,
  loading = 'lazy',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1.5 bg-zinc-100 px-2 text-center dark:bg-night-800 ${fallbackClassName} ${className}`}
        role="img"
        aria-label={showFallbackLabel ? `Sin imagen: ${alt}` : alt}
      >
        <FiImage
          className="h-8 w-8 text-zinc-300 dark:text-night-600"
          aria-hidden
        />
        {showFallbackLabel ? (
          <span className="text-[10px] font-medium leading-tight text-zinc-400 dark:text-zinc-500">
            Sin imagen
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      className={`${imgClassName} ${className}`.trim()}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
