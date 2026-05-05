import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RightPanel from '../components/RightPanel';
import MobileNav from '../components/MobileNav';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Layout() {
  return (
    <div className="min-h-screen font-sans text-tbank-black dark:text-white">
      <AnimatedBackground />

      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
            <Outlet />
          </div>
        </main>

        <RightPanel />
      </div>

      <MobileNav />
    </div>
  );
}
