import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const Navbar = ({ onMenuClick }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 h-16">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {isAuthenticated && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <span className="text-xl">☰</span>
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="font-bold text-xl text-neutral-800">LifeForce</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="text-neutral-700 hover:text-red-500 transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  <span className="text-sm font-medium text-neutral-700">{user?.name}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;