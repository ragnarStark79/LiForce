import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/navigation/Navbar';
import RoleSidebar from '../components/navigation/RoleSidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <RoleSidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
