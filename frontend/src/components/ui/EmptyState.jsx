export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = ""
}) {
  return (
    <div className={`text-center py-16 ${className}`}>
      {icon && (
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
          {icon}
        </div>
      )}
      
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
        {title}
      </h2>
      
      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  );
}