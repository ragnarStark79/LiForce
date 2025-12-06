import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../common/NotificationSystem';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const getProfilePath = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/admin/settings';
      case 'STAFF':
        return '/staff/profile';
      default:
        return '/user/profile';
    }
  };

  const handleLogout = async () => {
    await logout();
    notify.logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'from-purple-500 to-indigo-600';
      case 'STAFF':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-emerald-500 to-teal-600';
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 
                          transition-all duration-300 group"
                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute left-0 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300
                                   ${isSidebarOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
                  <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300
                                   ${isSidebarOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
                  <span className={`absolute left-0 w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300
                                   ${isSidebarOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
                </div>
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-11 w-11 bg-gradient-to-br from-primary-500 via-rose-500 to-pink-500 
                               rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30
                               group-hover:shadow-xl group-hover:shadow-primary-500/40 
                               transform transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white
                               animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  LifeForce
                </span>
                <span className="block text-[10px] text-gray-400 font-medium -mt-1">Blood Donation Network</span>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Quick Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <Link to={getDashboardPath()}>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 
                                      hover:bg-primary-50 rounded-xl transition-all duration-300">
                      Dashboard
                    </button>
                  </Link>
                </div>

                {/* Notifications Bell */}
                <button className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 
                                  transition-all duration-300 group">
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full 
                                  border-2 border-white animate-pulse" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-gray-50 hover:bg-gray-100
                              transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-rose-500 
                                     flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </p>
                      <p className={`text-[10px] font-bold bg-gradient-to-r ${getRoleBadgeColor()} 
                                   bg-clip-text text-transparent uppercase`}>
                        {user?.role}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 
                                   ${showProfileMenu ? 'rotate-180' : ''}`} 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 
                                     overflow-hidden z-20 fade-in-up">
                        {/* Profile Header */}
                        <div className="p-4 bg-gradient-to-r from-primary-500 to-rose-500">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm 
                                           flex items-center justify-center text-white text-xl font-bold">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{user?.name}</p>
                              <p className="text-white/80 text-sm">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link to={getProfilePath()} onClick={() => setShowProfileMenu(false)}>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 
                                             hover:bg-gray-50 rounded-xl transition-colors text-left">
                              <span className="text-lg">👤</span>
                              <span className="font-medium">My Profile</span>
                            </button>
                          </Link>
                          <Link to={getDashboardPath()} onClick={() => setShowProfileMenu(false)}>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 
                                             hover:bg-gray-50 rounded-xl transition-colors text-left">
                              <span className="text-lg">📊</span>
                              <span className="font-medium">Dashboard</span>
                            </button>
                          </Link>
                          <Link to={`/${user?.role?.toLowerCase()}/settings`} onClick={() => setShowProfileMenu(false)}>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 
                                             hover:bg-gray-50 rounded-xl transition-colors text-left">
                              <span className="text-lg">⚙️</span>
                              <span className="font-medium">Settings</span>
                            </button>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-gray-100">
                          <button 
                            onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 
                                      hover:bg-red-50 rounded-xl transition-colors text-left"
                          >
                            <span className="text-lg">🚪</span>
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 
                                    transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white 
                                    text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30
                                    hover:shadow-xl hover:shadow-primary-500/40 
                                    transform transition-all duration-300 hover:scale-105">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;