import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKitchenMembers, removeMember, leaveKitchen } from "../../features/members/memberThunks";
import { refreshUser } from "../../features/auth/authThunks";
import PageLayout from "../../components/layout/PageLayout";
import { SearchInput, Button, Card, LoadingSpinner, EmptyState } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { showAlert } from "../../utils/sweetAlert";
import { Users } from "lucide-react";
import websocketService from "../../services/websocketService";

export default function MemberList() {
  const dispatch = useDispatch();
  const { members, loading, error } = useSelector((state) => state.members);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast.error("Failed to load members");
    }
  }, [error]);
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
    if (!user?.kitchenId) return;

    const handleMemberAdded = () => {
      console.log('🔄 New member added - refreshing list');
      dispatch(fetchKitchenMembers());
    };

    websocketService.subscribeToKitchen(user.kitchenId, handleMemberAdded);

    return () => {
      websocketService.unsubscribeFromKitchen(user.kitchenId);
    };
  }, [dispatch, user?.kitchenId]);

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
        const errorData = await response.json();
        setPasswordError(errorData.error || "Incorrect password");
      }
    } catch (error) {
      setPasswordError("Failed to verify password");
    }
  };

  const handleRemoveMember = async (memberId) => {
    const member = members.find(m => m.id === memberId);
    const result = await showAlert.confirm(
      'Remove Member',
      `Are you sure you want to remove ${member?.username || 'this member'} from the kitchen?`,
      'Yes, remove'
    );
    
    if (result.isConfirmed) {
      dispatch(removeMember(memberId)).then(() => {
        dispatch(fetchKitchenMembers());
        // Force refresh current user data if they removed themselves
        if (memberId === user?.id) {
          window.location.href = '/login';
        }
      });
    }
  };

  const handleLeaveKitchen = async () => {
    const result = await showAlert.confirm(
      'Leave Kitchen',
      'Are you sure you want to leave this kitchen? You will lose access to all kitchen data.',
      'Yes, leave kitchen'
    );
    
    if (result.isConfirmed) {
      dispatch(leaveKitchen()).then(() => {
        window.location.href = '/user';
      });
    }
  };

  const getRoleColor = (role) => {
    return role === "ADMIN" ? "bg-green-200 text-green-900" : "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <PageLayout
        title="Kitchen Members"
        subtitle="Manage your kitchen team"
        icon={<Users className="w-6 h-6" />}
      >
        <LoadingSpinner text="Loading members..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Kitchen Members"
      subtitle={`Manage your kitchen team • ${filteredMembers.length} members`}
      icon={<Users className="w-6 h-6" />}
      headerActions={user?.role === "MEMBER" && (
        <Button variant="danger" onClick={handleLeaveKitchen}>
          Leave Kitchen
        </Button>
      )}
    >
      {kitchen && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-8">
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
                <form onSubmit={(e) => { e.preventDefault(); handleShowInvitationCode(); }} className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Enter password to view"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Button type="submit">
                    Show Code
                  </Button>
                </form>
              )}
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <SearchInput
          placeholder="Search members by name, email, or role..."
          onSearch={setSearchTerm}
        />
      </div>



      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="No Members Found"
          description={
            searchTerm 
              ? "Try adjusting your search terms." 
              : "No members in this kitchen yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} hover>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {member.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
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
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="w-full"
                >
                  Remove Member
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}