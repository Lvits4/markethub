import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';

type AuthBrandProps = {
  /** `dark`: texto claro e icono para usar sobre el hero azul */
  surface?: 'light' | 'dark';
  className?: string;
};

export function AuthBrand({
  surface = 'light',
  className = '',
}: AuthBrandProps) {
  const onDark = surface === 'dark';

  return (
    <Link
      to={routePaths.catalog}
      className={`inline-flex items-center gap-2.5 transition ${
        onDark ? 'opacity-95 hover:opacity-100' : 'opacity-90 hover:opacity-100'
      } ${className}`.trim()}
    >
      <span
        className={`box-border flex aspect-square h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[9999px] border-2 text-lg font-bold shadow-md ${
          onDark
            ? 'border-white/30 bg-white/15 text-white shadow-black/25'
            : 'border-white/35 bg-auth-primary text-white shadow-auth-primary/35 dark:border-white/25'
        }`}
      >
        M
      </span>
      <span
        className={`text-xl font-semibold tracking-tight ${
          onDark ? 'text-white' : 'text-auth-primary'
        }`}
      >
        MarketHub
      </span>
    </Link>
  );
}
