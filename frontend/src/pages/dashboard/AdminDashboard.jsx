import RightSidebar from "../../components/layout/RightSidebar";
import InventoryStats from "../../components/dashboard/InventoryStats";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex font-inter antialiased">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 h-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your kitchen and monitor inventory</p>
            </div>
          </div>

          <InventoryStats />
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}