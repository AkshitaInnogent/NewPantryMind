import RightSidebar from "./RightSidebar";
import { BackButton } from "../ui";

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  icon, 
  headerActions,
  showBackButton = true,
  backButtonFallback = null,
  className = ""
}) {
  return (
    <div className="h-screen bg-gray-50 flex font-inter antialiased overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 ${className}`}>
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-4">
              <BackButton fallbackPath={backButtonFallback} />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {icon && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 sm:gap-3">
                {headerActions}
              </div>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      <div className="hidden xl:block flex-shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
}