import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({ 
  loading = false, 
  variant = "primary", 
  size = "md", 
  icon,
  children, 
  className = "", 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-600 shadow-md shadow-indigo-500/20",
    secondary: "bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-950/50 text-zinc-100 border border-zinc-700/50 focus:ring-gray-200",
    danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-600 shadow-md shadow-red-500/20",
    ghost: "bg-transparent hover:bg-zinc-800/50 text-zinc-300 shadow-none border-none focus:ring-gray-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${loading ? "opacity-80 cursor-wait" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export default Button;
