import RightSidebar from "./RightSidebar";

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  icon, 
  headerActions,
  className = ""
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-inter antialiased">
      <div className="flex-1 p-6">
        <div className={`bg-white rounded-xl shadow-sm p-6 md:p-8 h-full ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {icon && (
                <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">
                {headerActions}
              </div>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}