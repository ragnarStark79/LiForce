import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ items, isOpen = true }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed top-16 left-0 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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