import RightSidebar from "../../components/layout/RightSidebar";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Settings
          </h1>
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Kitchen Settings and Preferences
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This page will contain kitchen settings and user preferences.
            </p>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}