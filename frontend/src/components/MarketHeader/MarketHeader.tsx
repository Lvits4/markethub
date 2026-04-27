import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { routePaths } from '../../config/routes';
import { useAuth } from '../../hooks/useAuth';
import { useCartQuery } from '../../queries/useCartQuery';
import { MarketHubMark } from '../AuthBrand/AuthBrand';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

/** Mantiene la barra tipo glass existente en mobile (< lg). */
const mobileFrostedBar =
  'max-lg:border-zinc-300/55 max-lg:bg-white/82 max-lg:shadow-[0_10px_44px_-18px_rgba(15,23,42,0.2),inset_0_1px_0_0_rgba(255,255,255,0.72)] max-lg:backdrop-blur-3xl max-lg:backdrop-saturate-[1.45] max-lg:supports-[backdrop-filter]:bg-white/[0.52] max-lg:dark:border-night-600/45 max-lg:dark:bg-night-950/78 max-lg:dark:shadow-[0_14px_48px_-16px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] max-lg:dark:backdrop-blur-[40px] max-lg:dark:backdrop-saturate-[1.2] max-lg:supports-[backdrop-filter]:dark:bg-night-950/[0.48]';

const desktopLinkIdle =
  'text-sm font-medium text-zinc-700 transition-colors hover:text-forest dark:text-white/90 dark:hover:text-white';

const desktopLinkActive =
  'text-sm font-semibold text-forest underline decoration-forest decoration-1 underline-offset-[10px] dark:text-market-dark-accent dark:decoration-market-dark-accent';

const desktopCartIconBtn =
  'flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-transparent hover:text-forest dark:text-white/90 dark:hover:bg-transparent dark:hover:text-market-dark-accent';

const desktopAccountIconBtn =
  'hidden h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-transparent hover:text-forest active:text-forest lg:inline-flex dark:text-white/90 dark:hover:bg-transparent dark:hover:text-market-dark-accent dark:active:text-market-dark-accent';

function readScrollY(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function MarketHeader() {
  const { isAuthenticated } = useAuth();
  const { data: cart } = useCartQuery();
  const [desktopScrolled, setDesktopScrolled] = useState(false);

  const cartCount = cart?.items?.length ?? 0;

  useEffect(() => {
    const onScroll = () => setDesktopScrolled(readScrollY() > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerClassName = [
    'fixed top-0 right-0 left-0 z-50 h-14 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-out',
    mobileFrostedBar,
    desktopScrolled
      ? 'lg:border-white/20 lg:bg-white/[0.14] lg:shadow-[0_12px_30px_-18px_rgba(2,6,23,0.45)] lg:backdrop-blur-xl lg:backdrop-saturate-125 lg:supports-[backdrop-filter]:bg-white/[0.12] lg:dark:border-white/12 lg:dark:bg-night-950/[0.28] lg:dark:shadow-[0_14px_34px_-18px_rgba(0,0,0,0.58)] lg:dark:backdrop-blur-2xl lg:dark:backdrop-saturate-110 lg:supports-[backdrop-filter]:dark:bg-night-950/[0.24]'
      : 'lg:border-transparent lg:bg-transparent lg:shadow-none lg:backdrop-blur-none lg:dark:border-transparent lg:dark:bg-transparent',
  ].join(' ');

  return (
    <header className={headerClassName}>
      <div className="relative mx-auto flex h-full w-full max-w-6xl items-center px-4 lg:px-6">
        <NavLink
          to={routePaths.catalog}
          end
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-forest dark:text-market-dark-accent"
        >
          <MarketHubMark
            size="nav"
            className="border-forest! bg-forest! text-white! shadow-md! dark:border-market-dark-accent! dark:bg-market-dark-accent! dark:text-night-950!"
          />
          MarketHub
        </NavLink>

        <nav
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 lg:flex"
          aria-label="Principal escritorio"
        >
          <NavLink
            to={routePaths.catalog}
            end
            className={({ isActive }) =>
              isActive ? desktopLinkActive : desktopLinkIdle
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to={routePaths.stores}
            className={({ isActive }) =>
              isActive ? desktopLinkActive : desktopLinkIdle
            }
          >
            Tiendas
          </NavLink>
          <NavLink
            to={routePaths.favorites}
            className={({ isActive }) =>
              isActive ? desktopLinkActive : desktopLinkIdle
            }
          >
            Favoritos
          </NavLink>
          {isAuthenticated ? (
            <NavLink
              to={routePaths.orders}
              className={({ isActive }) =>
                isActive ? desktopLinkActive : desktopLinkIdle
              }
            >
              Pedidos
            </NavLink>
          ) : null}
        </nav>

        <div className="min-w-0 flex-1" aria-hidden />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 lg:gap-2">
          <div className="hidden items-center gap-0.5 pr-2 lg:flex">
            <NavLink
              to={routePaths.cart}
              className={`${desktopCartIconBtn} relative`}
              aria-label={`Carrito${cartCount ? `, ${cartCount} articulos` : ''}`}
            >
              <FiShoppingCart className="h-5 w-5" strokeWidth={2} aria-hidden />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-forest px-1 text-[10px] font-semibold text-white tabular-nums">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </NavLink>
          </div>

          <ThemeToggle className="h-10! w-10! rounded-lg! bg-transparent! text-zinc-700! shadow-none! ring-0! outline-none! transition-colors hover:bg-transparent! hover:text-forest! active:bg-transparent! active:text-forest! dark:bg-transparent! dark:text-white/90! dark:hover:bg-transparent! dark:hover:text-market-dark-accent! dark:active:bg-transparent! dark:active:text-market-dark-accent!" />

          {isAuthenticated ? (
            <NavLink
              to={routePaths.settings}
              className={desktopAccountIconBtn}
              aria-label="Mi cuenta"
            >
              <FiUser className="h-5 w-5" strokeWidth={2} aria-hidden />
            </NavLink>
          ) : (
            <NavLink
              to={routePaths.register}
              className="hidden rounded-md bg-forest px-4 py-2 text-sm font-medium text-white transition hover:bg-admin-primary-hover lg:inline-flex dark:bg-market-dark-accent dark:text-night-950 dark:hover:bg-[#6ea8ee]"
            >
              Registrarse
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
