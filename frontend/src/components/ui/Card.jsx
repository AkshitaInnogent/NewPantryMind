export default function Card({ 
  children, 
  className = "",
  hover = false,
  padding = "md"
}) {
  const baseClasses = "bg-white rounded-lg shadow";
  const hoverClasses = hover ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl cursor-pointer" : "";
  
  const paddings = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}