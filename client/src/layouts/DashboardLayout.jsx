import { Outlet } from 'react-router-dom';
import GlassNavbar from '../components/navigation/GlassNavbar';

/**
 * DashboardLayout - Main layout for authenticated dashboard pages
 * Uses Apple Music style GlassNavbar with:
 * - Floating logo (top-left) + profile (top-right)
 * - Bottom tab bar for menu navigation
 */
const DashboardLayout = () => {
  return (
    <div className="min-h-screen staffdash-zen">
      <div className="staffdash-bg" />

      <GlassNavbar />

      {/* Main Content - padding to avoid overlap with fixed navbar */}
      <main className="relative px-4 sm:px-6 pt-20 pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
