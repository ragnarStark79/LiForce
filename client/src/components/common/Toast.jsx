import { useEffect } from 'react';

const Toast = ({ 
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-secondary-50 border-secondary-200 text-secondary-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 min-w-[300px] max-w-md
        p-4 rounded-soft border-2 shadow-soft-lg
        animate-slide-down
        ${typeClasses[type]}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-100 transition-smooth"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
