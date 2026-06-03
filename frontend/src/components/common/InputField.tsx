
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode; 
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, id, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`
              w-full px-4 py-2.5 
              ${icon ? 'pl-10' : ''}
              border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
              transition-all duration-200
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70
              ${
                error 
                  ? 'border-red-500 bg-red-50/50 focus:ring-red-500/50 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }
              ${className || ''}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;