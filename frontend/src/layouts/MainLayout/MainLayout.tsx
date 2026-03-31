import { Outlet } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';

export function MainLayout() {
  return (
    <div className="min-h-screen pb-28">
      <div className="sticky top-0 z-30 flex justify-end px-4 pt-3">
        <ThemeToggle />
      </div>
      <Outlet />
      <BottomNav />
    </div>
  );
}
