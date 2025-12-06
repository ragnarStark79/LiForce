import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ items, isOpen = true, isMobile = false, onClose }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside 
      className={`
        w-64 bg-white shadow-lg h-[calc(100vh-64px)] fixed top-16 left-0 overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'z-50' : 'z-30'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Close button for mobile */}
      {isMobile && (
        <div className="flex justify-end p-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-red-50 text-red-600 font-medium' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                  }
                `}
              >
                {item.icon && <span className="text-xl">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;