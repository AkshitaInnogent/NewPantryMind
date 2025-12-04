import RightSidebar from "../../components/layout/RightSidebar";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Dashboard
          </h1>

          {/* Welcome Content */}
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to your Kitchen Dashboard
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your kitchen inventory, track expiry dates, and collaborate with your team members. 
              Use the menu on the right to navigate through different features.
            </p>
          </div>
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}