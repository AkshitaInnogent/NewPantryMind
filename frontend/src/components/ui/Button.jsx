export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  loading = false,
  onClick,
  className = "",
  ...props 
}) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "border border-green-600 text-green-700 hover:bg-green-50",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "text-green-600 hover:bg-green-50"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}