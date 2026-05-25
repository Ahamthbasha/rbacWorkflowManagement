// components/common/PasswordField.tsx
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode; // Add icon prop
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, className, id, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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
            type={showPassword ? "text" : "password"}
            className={`
              w-full px-4 py-2.5
              ${icon ? 'pl-10' : 'pr-12'}
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-0.5
              transition-colors duration-200
            "
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
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

PasswordField.displayName = "PasswordField";

export default PasswordField;