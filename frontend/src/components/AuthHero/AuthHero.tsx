import { AuthBrand } from '../AuthBrand/AuthBrand';

export type AuthHeroVariant = 'banner' | 'split';

type AuthHeroProps = {
  variant: AuthHeroVariant;
};

export function AuthHero({ variant }: AuthHeroProps) {
  if (variant === 'banner') {
    return (
      <div className="relative overflow-hidden bg-linear-to-r from-auth-primary via-auth-primary-hover to-[#1e3a8a] px-5 py-4 text-white">
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-md bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-md bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <AuthBrand surface="dark" />
          <p className="text-sm text-white/85 sm:min-w-0 sm:border-l sm:border-white/25 sm:pl-4">
            Tu marketplace, en un solo lugar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-40 min-w-0 flex-col justify-between overflow-hidden bg-linear-to-br from-auth-primary via-auth-primary-hover to-[#172554] px-8 pb-7 pt-7 text-white lg:min-h-0 lg:px-10 lg:pb-9 lg:pt-9">
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 -translate-y-1/2 rounded-md bg-sky-300/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-md bg-indigo-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-8 h-px w-[120%] -translate-x-1/2 rotate-[-8deg] bg-linear-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />
      <div className="relative">
        <AuthBrand surface="dark" className="mb-3" />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
          Bienvenido
        </p>
        <h1 className="mt-1.5 max-w-[14ch] text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          Compra y vende con confianza
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
          Descubre productos, gestiona tu cuenta y sigue tus pedidos desde un
          solo panel.
        </p>
      </div>
      <div className="relative mt-8 flex items-end gap-3 lg:mt-10">
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-9 w-9 rounded-md border-2 border-white/30 bg-white/20 ring-2 ring-auth-primary"
            />
          ))}
        </div>
        <p className="pb-0.5 text-xs text-white/75">
          Miles de usuarios ya confían en MarketHub
        </p>
      </div>
    </div>
  );
}
