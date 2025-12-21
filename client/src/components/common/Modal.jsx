import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop with blur effect and better visibility */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.08), transparent 60%)'
        }}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl
            w-full ${sizeClasses[size]} animate-scale-in
            border border-white/60
            ${className}
          `}
          style={{
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/80">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30"></div>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 
                         hover:rotate-90 transform p-2 hover:bg-gray-100/80 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-8">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-gray-100/80 bg-gradient-to-b from-transparent to-gray-50/50 rounded-b-3xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
