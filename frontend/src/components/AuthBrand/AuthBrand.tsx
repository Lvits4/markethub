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
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow-md ring-2 ${
          onDark
            ? 'bg-white/15 text-white shadow-black/20 ring-white/25'
            : 'bg-auth-primary text-white shadow-auth-primary/40 ring-white/25 dark:ring-white/15'
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
