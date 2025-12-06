import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
