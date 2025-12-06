const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3 rounded-soft border
          ${error ? 'border-danger-300 focus:border-danger-500' : 'border-neutral-200 focus:border-primary-500'}
          bg-white focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-danger-100' : 'focus:ring-primary-100'}
          transition-smooth
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
