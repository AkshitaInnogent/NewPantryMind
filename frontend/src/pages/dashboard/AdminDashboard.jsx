import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RightSidebar from "../../components/layout/RightSidebar";

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

      <RightSidebar />
    </div>
  );
}