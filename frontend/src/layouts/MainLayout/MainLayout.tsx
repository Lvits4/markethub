import { Outlet } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { MarketHeader } from '../../components/MarketHeader/MarketHeader';

export function MainLayout() {
  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <MarketHeader />
      <Outlet />
      <BottomNav />
    </div>
  );
}
