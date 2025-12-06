import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/navigation/Navbar';
import RoleSidebar from '../components/navigation/RoleSidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, auto-close on mobile
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}
        
        <RoleSidebar 
          isOpen={isSidebarOpen} 
          isMobile={isMobile}
          onClose={closeSidebar}
        />
        
        <main className={`
          flex-1 p-4 sm:p-6 transition-all duration-300 min-h-[calc(100vh-64px)]
          ${!isMobile && isSidebarOpen ? 'lg:ml-64' : 'ml-0'}
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
