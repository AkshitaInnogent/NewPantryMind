import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchKitchenMembers, removeMember } from "../../features/members/memberThunks";
import { SearchInput } from "../../components/ui";

export default function MemberList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { members, loading, error } = useSelector((state) => state.members);
  const { user } = useSelector((state) => state.auth || {});
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [kitchen, setKitchen] = useState(null);
  const [showInvitationCode, setShowInvitationCode] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    dispatch(fetchKitchenMembers());
    if (user?.kitchenId) {
      fetchKitchenDetails();
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredMembers(members.filter(member =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredMembers(members);
    }
  }, [members, searchTerm]);

  const fetchKitchenDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/kitchens/${user.kitchenId}`, {
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

  const handleShowInvitationCode = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/user/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setShowInvitationCode(true);
        setPasswordError("");
        setPassword("");
      } else {
        setPasswordError("Invalid password");
      }
    } catch (error) {
      setPasswordError("Failed to verify password");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      dispatch(removeMember(memberId));
    }
  };

  const getRoleColor = (role) => {
    return role === "ADMIN" ? "bg-green-200 text-green-900" : "bg-green-100 text-green-800";
  };

  const menuItems = [
    {
      title: "Dashboard",
      description: "Back to dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      color: "green",
      onClick: () => navigate(user?.role === "ADMIN" ? "/admin" : "/member")
    },
    {
      title: "Inventory",
      description: "View and manage inventory items",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "blue",
      onClick: () => navigate("/inventory")
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
  ].filter(item => {
    if (item.title === "Settings" && user?.role !== "ADMIN") {
      return false;
    }
    return true;
  });

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Kitchen Members</h1>
            <div className="text-sm text-gray-600">
              Total: {filteredMembers.length} members
            </div>
          </div>

          {/* Kitchen Info with Invitation Code */}
          {kitchen && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Kitchen: {kitchen.name}
              </h2>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Invitation Code:</p>
                  {showInvitationCode ? (
                    <span className="text-2xl font-mono font-bold text-green-700 bg-white px-4 py-2 rounded-lg border">
                      {kitchen.invitationCode}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Enter password to view"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleShowInvitationCode}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Show Code
                      </button>
                    </div>
                  )}
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <SearchInput
              placeholder="Search members by name, email, or role..."
              onSearch={setSearchTerm}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">👤</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{member.username}</h3>
                {member.email && (
                  <p className="text-gray-600 text-sm mb-4">{member.email}</p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Joined: {new Date(member.createdAt || Date.now()).toLocaleDateString()}
                </div>

                {user?.role === "ADMIN" && member.role !== "ADMIN" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove Member
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No members found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms." : "No members in this kitchen yet."}
              </p>
            </div>
          )}
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