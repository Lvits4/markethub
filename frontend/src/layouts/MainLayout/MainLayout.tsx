import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { MarketHeader } from '../../components/MarketHeader/MarketHeader';

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <MarketHeader />
      <main className="pt-14">
        <div key={pathname} className="route-outlet-fade">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
