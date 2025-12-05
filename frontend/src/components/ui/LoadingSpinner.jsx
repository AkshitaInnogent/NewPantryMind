export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...",
  className = ""
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  return (
    <div className={`text-center py-20 ${className}`}>
      <div className={`${sizes[size]} mx-auto mb-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin`}></div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {text}
      </h3>
    </div>
  );
}