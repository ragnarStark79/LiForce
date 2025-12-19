import { Outlet } from 'react-router-dom';
import GlassNavbar from '../components/navigation/GlassNavbar';

/**
 * PublicLayout - Layout for public pages
 * Uses Apple Music style GlassNavbar
 */
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <GlassNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;

