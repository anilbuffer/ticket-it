import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'pink' | 'green' | 'coral' | 'navy' | 'outline' | 'ghost' | 'secondary-tab';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'pink',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 font-semibold',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 font-semibold',
    lg: 'text-sm px-5 py-2.5 gap-2.5 font-bold',
    icon: 'p-1.5 rounded',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    pink: 'bg-ticketit-pink hover:bg-ticketit-pink-hover text-white shadow-btn border border-transparent',
    green: 'bg-ticketit-green hover:bg-ticketit-green-hover text-white shadow-btn border border-transparent',
    coral: 'bg-[#FF6B6B] hover:bg-[#F25555] text-white shadow-btn border border-transparent',
    navy: 'bg-ticketit-navy hover:bg-ticketit-navy-light text-white shadow-btn border border-transparent',
    outline: 'bg-white hover:bg-[#F8FAFC] text-ticketit-navy border border-ticketit-border hover:border-gray-400 shadow-sm',
    ghost: 'bg-transparent hover:bg-black/5 text-ticketit-navy border border-transparent',
    'secondary-tab': 'bg-white text-ticketit-navy border border-ticketit-border hover:border-ticketit-pink hover:text-ticketit-pink text-xs font-semibold px-4 py-2 rounded shadow-sm',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
