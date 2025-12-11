import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { Button, Card } from "../../components/ui";
import axiosClient from "../../services/api";
import { showToast } from "../../utils/toast";
import { showAlert } from "../../utils/sweetAlert";
import { updateProfile, changePassword } from "../../features/auth/authThunks";
import { updateKitchen } from "../../features/kitchen/kitchenThunks";
import { leaveKitchen } from "../../features/members/memberThunks";
import { User, AlertTriangle, LogOut, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";

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
  const [actionPassword, setActionPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(null);

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
      showToast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Update failed:", error);
      showToast.error('Update failed: ' + (error.message || 'Unknown error'));
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

  const handleLeaveKitchen = () => {
    setShowPasswordPrompt('leave');
  };

  const handleDeleteKitchen = () => {
    setShowPasswordPrompt('delete');
  };

  const handlePasswordAction = async () => {
    if (!actionPassword) {
      showToast.error('Password is required');
      return;
    }

    try {
      // Verify password first
      await axiosClient.post('/user/verify-password', { password: actionPassword });
      
      if (showPasswordPrompt === 'leave') {
        await dispatch(leaveKitchen()).unwrap();
        window.location.href = '/user';
      } else if (showPasswordPrompt === 'delete') {
        await axiosClient.delete(`/kitchens/${user.kitchenId}`);
        const updatedUser = { ...user, role: 'USER', kitchenId: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.href = '/user';
      }
    } catch (error) {
      showToast.error('Incorrect password or action failed');
    }
    
    setShowPasswordPrompt(null);
    setActionPassword('');
  };

  const handleCancelAction = () => {
    setShowPasswordPrompt(null);
    setActionPassword('');
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showToast.error("New password must be at least 6 characters long");
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
      showToast.success("Password changed successfully!");
    } catch (error) {
      showToast.error("Password change failed: " + error);
    }
  };

  // Simple layout for USER role without sidebar
  if (user?.role === "USER") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your account and kitchen preferences</p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-6xl font-bold">
                {(user?.name || user?.username || "User").charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">@{user?.username}</span>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <Card>
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
            </Card>

            <Card>
              <h4 className="text-gray-800 font-medium mb-3">Kitchen Details</h4>
              {isEditing && user?.kitchenId && user?.role === "ADMIN" ? (
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
            </Card>
          </div>

          {isChangingPassword && (
            <Card className="mb-6">
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
            </Card>
          )}

          <div className="flex gap-3">
            {isChangingPassword ? (
              <>
                <Button 
                  onClick={handleSavePassword}
                  disabled={loading}
                  loading={loading}
                >
                  Change Password
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleCancelPasswordChange}
                >
                  Cancel
                </Button>
              </>
            ) : isEditing ? (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  loading={loading}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit}>
                  Edit Profile
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleChangePassword}
                >
                  Change Password
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full layout with sidebar for ADMIN/MEMBER roles
  return (
    <PageLayout
      title="Profile Settings"
      subtitle="Manage your account and kitchen preferences"
      icon={<User className="w-6 h-6" />}
    >
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-6xl font-bold">
            {(user?.name || user?.username || "User").charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500 text-sm">@{user?.username}</span>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <Card>
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
        </Card>

        <Card>
          <h4 className="text-gray-800 font-medium mb-3">Kitchen Details</h4>
          {isEditing && user?.kitchenId && user?.role === "ADMIN" ? (
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
        </Card>
      </div>

      {isChangingPassword && (
        <Card className="mb-6">
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
        </Card>
      )}

      <Modal
        isOpen={!!showPasswordPrompt}
        onClose={handleCancelAction}
        title={showPasswordPrompt === 'leave' ? 'Leave Kitchen' : 'Delete Kitchen'}
      >
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            {showPasswordPrompt === 'leave' ? (
              <LogOut className="w-6 h-6 text-green-600" />
            ) : (
              <Trash2 className="w-6 h-6 text-green-600" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showPasswordPrompt === 'leave' ? 'Leave Kitchen?' : 'Delete Kitchen?'}
          </h3>
          <p className="text-sm text-gray-500">
            {showPasswordPrompt === 'leave'
              ? 'You will be removed from this kitchen and lose access to all inventory.'
              : 'This will permanently delete the kitchen and remove all members and inventory. This action cannot be undone.'}
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your password to confirm
          </label>
          <input
            type="password"
            value={actionPassword}
            onChange={(e) => setActionPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Password"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="danger" 
            onClick={handlePasswordAction}
            className="flex-1"
          >
            {showPasswordPrompt === 'leave' ? 'Leave Kitchen' : 'Delete Kitchen'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleCancelAction}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      <div className="flex gap-3">
        {isChangingPassword ? (
          <>
            <Button 
              onClick={handleSavePassword}
              disabled={loading}
              loading={loading}
            >
              Change Password
            </Button>
            <Button 
              variant="secondary"
              onClick={handleCancelPasswordChange}
            >
              Cancel
            </Button>
          </>
        ) : isEditing ? (
          <>
            <Button 
              onClick={handleSave}
              disabled={loading}
              loading={loading}
            >
              Save Changes
            </Button>
            <Button 
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleEdit}>
              Edit Profile
            </Button>
            <Button 
              variant="secondary"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
            {user?.role === "MEMBER" && (
              <Button 
                variant="danger"
                onClick={handleLeaveKitchen}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave Kitchen
              </Button>
            )}
            {user?.role === "ADMIN" && (
              <Button 
                variant="danger"
                onClick={handleDeleteKitchen}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Kitchen
              </Button>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}