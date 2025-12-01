import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [kitchen, setKitchen] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchKitchenDetails();
    }
  }, [user]);

  const fetchKitchenDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/kitchens/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setKitchen(data);
      }
    } catch (error) {
      console.error('Failed to fetch kitchen details:', error);
    }
  };

  const menuItems = [
    {
      title: "Inventory",
      description: "View and manage inventory items",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "green",
      onClick: () => navigate("/inventory")
    },
    {
      title: "Members", 
      description: "Manage kitchen members",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: "blue",
      onClick: () => navigate("/members")
    },
    {
      title: "Reports",
      description: "View detailed reports", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "purple",
      onClick: () => {}
    },
    {
      title: "Settings",
      description: "Kitchen settings and preferences",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      purple: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200",
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
            Admin Dashboard
          </h1>

          {/* Kitchen Info */}
          {kitchen && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Kitchen: {kitchen.name}
              </h2>
            </div>
          )}

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