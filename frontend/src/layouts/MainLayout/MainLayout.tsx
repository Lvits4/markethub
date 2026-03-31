import { Outlet } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav/BottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen pb-28">
      <Outlet />
      <BottomNav />
    </div>
  );
}
