const Checkbox = ({ 
  label, 
  name, 
  checked = false, 
  onChange, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-5 h-5 rounded border-neutral-300 
          text-red-500 focus:ring-2 focus:ring-red-100
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {label && (
        <label 
          htmlFor={name} 
          className="ml-3 text-sm text-neutral-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
