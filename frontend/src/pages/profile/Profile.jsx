import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import RightSidebar from "../../components/layout/RightSidebar";
import axiosClient from "../../services/api";
import { updateProfile, changePassword } from "../../features/auth/authThunks";
import { updateKitchen } from "../../features/kitchen/kitchenThunks";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [kitchenName, setKitchenName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    kitchenName: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user?.kitchenId) {
      axiosClient.get(`/kitchens/${user.kitchenId}`)
        .then(response => {
          setKitchenName(response.data.name || "");
          setFormData(prev => ({ ...prev, kitchenName: response.data.name || "" }));
        })
        .catch((error) => {
          console.error('Failed to fetch kitchen details:', error);
          setKitchenName("No kitchen assigned");
          setFormData(prev => ({ ...prev, kitchenName: "" }));
        });
    } else {
      setKitchenName("No kitchen assigned");
      setFormData(prev => ({ ...prev, kitchenName: "" }));
    }
  }, [user?.kitchenId]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        kitchenName: kitchenName
      });
    }
  }, [user, kitchenName]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      kitchenName: kitchenName
    });
  };

  const handleSave = async () => {
    try {
      const updatedUser = await dispatch(updateProfile({
        username: formData.username,
        name: formData.name,
        email: formData.email
      })).unwrap();

      // Update kitchen name if changed and user has kitchen
      if (user?.kitchenId && formData.kitchenName !== kitchenName) {
        await dispatch(updateKitchen({
          kitchenId: user.kitchenId,
          name: formData.kitchenName
        })).unwrap();
        setKitchenName(formData.kitchenName);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Update failed:", error);
      alert('Update failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      alert("Password changed successfully!");
    } catch (error) {
      alert("Password change failed: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="flex-1 p-8 flex gap-6">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-8 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Profile</h2>

          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-6xl font-bold">
                {(user?.name || user?.username || "User").charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">@{user?.username}</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="text-gray-800 font-medium mb-3">Contact Information</h4>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-1">Username:</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-1">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-1">Email:</span>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="text-gray-800 font-medium mb-3">Kitchen Details</h4>
              {isEditing ? (
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-1">Kitchen Name:</label>
                  <input
                    type="text"
                    name="kitchenName"
                    value={formData.kitchenName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"

                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 mr-1">Kitchen Name:</span>
                  <span className="text-sm text-gray-600">{kitchenName || 'No kitchen assigned'}</span>
                </div>
              )}
            </div>
          </div>

          {isChangingPassword && (
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h4 className="text-gray-800 font-medium mb-3">Change Password</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-1">Current Password:</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-1">New Password:</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-1">Confirm New Password:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isChangingPassword ? (
              <>
                <button 
                  onClick={handleSavePassword}
                  disabled={loading}
                  className="bg-green-800 text-white font-medium py-2 px-6 rounded-md hover:bg-green-900 transition disabled:opacity-50"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button 
                  onClick={handleCancelPasswordChange}
                  className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            ) : isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-800 text-white font-medium py-2 px-6 rounded-md hover:bg-green-900 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  onClick={handleCancel}
                  className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleEdit}
                  className="bg-green-800 text-white font-medium py-2 px-6 rounded-md hover:bg-green-900 transition"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleChangePassword}
                  className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-80 shrink-0">
           <RightSidebar />
        </div>
      </div>
    </div>
  );
}