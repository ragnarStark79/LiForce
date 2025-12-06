import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Notification Context
const NotificationContext = createContext(null);

// Notification Types with icons and colors
const NOTIFICATION_TYPES = {
  success: {
    icon: '✓',
    bgColor: 'bg-gradient-to-r from-emerald-500 to-green-600',
    borderColor: 'border-emerald-400',
    iconBg: 'bg-emerald-400/20',
  },
  error: {
    icon: '✕',
    bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
    borderColor: 'border-red-400',
    iconBg: 'bg-red-400/20',
  },
  warning: {
    icon: '⚠',
    bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
    borderColor: 'border-amber-400',
    iconBg: 'bg-amber-400/20',
  },
  info: {
    icon: 'ℹ',
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400',
    iconBg: 'bg-blue-400/20',
  },
  login: {
    icon: '👋',
    bgColor: 'bg-gradient-to-r from-violet-500 to-purple-600',
    borderColor: 'border-violet-400',
    iconBg: 'bg-violet-400/20',
  },
  logout: {
    icon: '👋',
    bgColor: 'bg-gradient-to-r from-slate-500 to-gray-600',
    borderColor: 'border-slate-400',
    iconBg: 'bg-slate-400/20',
  },
  approval: {
    icon: '✅',
    bgColor: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    borderColor: 'border-teal-400',
    iconBg: 'bg-teal-400/20',
  },
  schedule: {
    icon: '📅',
    bgColor: 'bg-gradient-to-r from-pink-500 to-rose-600',
    borderColor: 'border-pink-400',
    iconBg: 'bg-pink-400/20',
  },
  request: {
    icon: '🩸',
    bgColor: 'bg-gradient-to-r from-red-600 to-red-700',
    borderColor: 'border-red-500',
    iconBg: 'bg-red-400/20',
  },
  update: {
    icon: '🔄',
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400',
    iconBg: 'bg-cyan-400/20',
  },
  notification: {
    icon: '🔔',
    bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-400',
    iconBg: 'bg-indigo-400/20',
  },
};

// Single Notification Component
const NotificationItem = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const type = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden
        ${isExiting ? 'notification-slide-out' : 'notification-slide-in'}
        ${type.bgColor}
        rounded-2xl shadow-2xl
        border-l-4 ${type.borderColor}
        backdrop-blur-sm
        min-w-[320px] max-w-[420px]
        transform transition-all duration-300
      `}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Progress bar */}
      {notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-white/50 progress-grow"
            style={{ '--progress-width': '100%', animationDuration: `${notification.duration}ms` }}
          />
        </div>
      )}

      <div className="relative p-4 flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl ${type.iconBg}
          flex items-center justify-center
          text-2xl shadow-lg
          bounce-in
        `}>
          {notification.icon || type.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          {notification.title && (
            <h4 className="font-bold text-white text-sm tracking-wide uppercase mb-1">
              {notification.title}
            </h4>
          )}
          <p className="text-white/90 text-sm leading-relaxed">
            {notification.message}
          </p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs font-semibold text-white/80 hover:text-white 
                         underline underline-offset-2 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white/80 hover:text-white
                     transition-all duration-200 hover:scale-110"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Notification Container
const NotificationContainer = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>,
    document.body
  );
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const duration = notification.duration ?? 5000;

    setNotifications((prev) => [...prev, { ...notification, id, duration }]);

    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }

    return id;
  }, [removeNotification]);

  // Convenience methods
  const notify = {
    success: (message, options = {}) => 
      addNotification({ type: 'success', title: 'Success', message, ...options }),
    error: (message, options = {}) => 
      addNotification({ type: 'error', title: 'Error', message, ...options }),
    warning: (message, options = {}) => 
      addNotification({ type: 'warning', title: 'Warning', message, ...options }),
    info: (message, options = {}) => 
      addNotification({ type: 'info', title: 'Info', message, ...options }),
    login: (userName, options = {}) => 
      addNotification({ type: 'login', title: 'Welcome Back!', message: `Hello ${userName}, you've successfully logged in.`, ...options }),
    logout: (options = {}) => 
      addNotification({ type: 'logout', title: 'Goodbye!', message: 'You have been logged out successfully.', ...options }),
    approval: (message, options = {}) => 
      addNotification({ type: 'approval', title: 'Approved', message, ...options }),
    schedule: (message, options = {}) => 
      addNotification({ type: 'schedule', title: 'Scheduled', message, ...options }),
    request: (message, options = {}) => 
      addNotification({ type: 'request', title: 'Blood Request', message, ...options }),
    update: (message, options = {}) => 
      addNotification({ type: 'update', title: 'Updated', message, ...options }),
    custom: (options) => addNotification(options),
  };

  return (
    <NotificationContext.Provider value={{ notify, addNotification, removeNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
