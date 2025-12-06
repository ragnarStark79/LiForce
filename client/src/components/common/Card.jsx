const Card = ({ 
  children, 
  title,
  subtitle,
  className = '',
  headerAction,
  hover = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md p-6
        ${hover ? 'hover:-translate-y-1 hover:shadow-lg' : ''}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;