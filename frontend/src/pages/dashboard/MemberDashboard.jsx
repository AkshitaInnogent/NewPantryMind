import { useNavigate } from "react-router-dom";

export default function MemberDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "My Inventory",
      description: "View and manage items",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "green",
      onClick: () => navigate("/inventory")
    },
    {
      title: "Shopping List",
      description: "Add items to buy",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      color: "blue",
      onClick: () => {}
    },
    {
      title: "Expiry Alerts",
      description: "Check expiring items",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "orange",
      onClick: () => {}
    },
    {
      title: "Profile",
      description: "Update your profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "gray",
      onClick: () => {}
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200",
      orange: "bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200",
      gray: "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Member Dashboard
          </h1>

          {/* Welcome Content */}
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to your Kitchen
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your inventory items, manage your shopping list, and stay updated with expiry alerts. 
              Use the menu on the right to access different features.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar Menu */}
      <div className="w-80 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
          
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getColorClasses(item.color)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-current">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm opacity-75 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}