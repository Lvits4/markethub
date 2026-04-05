import { Link } from 'react-router-dom';
import { routePaths } from '../../config/routes';

type MarketHubMarkProps = {
  /** `dark`: mismo contraste que sobre el hero azul del auth */
  surface?: 'light' | 'dark';
  /** `auth`: login; `nav`: barra principal */
  size?: 'auth' | 'nav';
  className?: string;
};

export function MarketHubMark({
  surface = 'light',
  size = 'auth',
  className = '',
}: MarketHubMarkProps) {
  const onDark = surface === 'dark';
  const sizeClass =
    size === 'auth' ? 'h-10 w-10 text-lg' : 'h-8 w-8 text-sm font-bold';

  return (
    <span
      className={`box-border flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-[9999px] border-2 shadow-md ${sizeClass} ${
        onDark
          ? 'border-white/30 bg-white/15 text-white shadow-black/25'
          : 'border-white/35 bg-auth-primary text-white shadow-auth-primary/35 dark:border-white/25'
      } ${className}`.trim()}
      aria-hidden
    >
      M
    </span>
  );
}

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
      <MarketHubMark surface={onDark ? 'dark' : 'light'} size="auth" />
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
