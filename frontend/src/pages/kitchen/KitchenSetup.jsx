import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createKitchenWithAdmin, joinKitchen } from "../../features/kitchen/kitchenThunks";
import { showToast } from "../../utils/toast";

export default function KitchenSetup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.kitchen);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedOption, setSelectedOption] = useState("");
  const [kitchenName, setKitchenName] = useState("");
  const [kitchenCode, setKitchenCode] = useState("");

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'create' || mode === 'join') {
      setSelectedOption(mode);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Debug: Check user state
    console.log(" Current user state:", user);
    console.log(" User ID:", user?.id);
    
    if (selectedOption === "create") {
      console.log(" Creating kitchen with name:", kitchenName);
      dispatch(createKitchenWithAdmin({ name: kitchenName }))
        .unwrap()
        .then(() => {
          console.log(" Kitchen created! You are now ADMIN");
          showToast.success(`Kitchen "${kitchenName}" created successfully! You are now the admin.`);
          navigate("/admin");
        })
        .catch((error) => {
          console.error(" Kitchen creation failed:", error);
          showToast.error(error.message || "Failed to create kitchen. Please try again.");
        });
    } else if (selectedOption === "join") {
      dispatch(joinKitchen({ invitationCode: kitchenCode }))
        .unwrap()
        .then(() => {
          console.log(" Kitchen joined! You are now MEMBER");
          showToast.success("Successfully joined the kitchen! You are now a member.");
          navigate("/member");
        })
        .catch((error) => {
          console.error("Kitchen join failed:", error);
          showToast.error(error.message || "Failed to join kitchen. Please check the invitation code.");
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200">
        
        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          🏠 Setup Your Kitchen
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Choose Your Kitchen
        </h2>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error.message || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Option Selection */}
          <div className="space-y-4">
            <div 
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedOption === "create" 
                  ? "border-[#1fa74a] bg-[#f0f9f3]" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedOption("create")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="kitchenOption"
                  value="create"
                  checked={selectedOption === "create"}
                  onChange={() => setSelectedOption("create")}
                  className="text-[#1fa74a]"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Create New Kitchen 
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-2">ADMIN</span>
                  </h3>
                  <p className="text-sm text-gray-600">Start fresh with your own kitchen</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedOption === "join" 
                  ? "border-[#1fa74a] bg-[#f0f9f3]" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedOption("join")}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="kitchenOption"
                  value="join"
                  checked={selectedOption === "join"}
                  onChange={() => setSelectedOption("join")}
                  className="text-[#1fa74a]"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Join Existing Kitchen
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">MEMBER</span>
                  </h3>
                  <p className="text-sm text-gray-600">Connect with family or roommates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Input Fields */}
          {selectedOption === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kitchen Name
              </label>
              <input
                type="text"
                value={kitchenName}
                onChange={(e) => setKitchenName(e.target.value)}
                placeholder="e.g., Smith Family Kitchen"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
                required
              />
            </div>
          )}

          {selectedOption === "join" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Code
              </label>
              <input
                type="text"
                value={kitchenCode}
                onChange={(e) => setKitchenCode(e.target.value.toUpperCase())}
                placeholder="Enter invitation code (e.g., ABC12345)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
                maxLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask your kitchen admin for the invitation code
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedOption || loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
              !selectedOption || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
            }`}
          >
            {loading 
              ? "Setting up..." 
              : selectedOption === "create" 
                ? "Create Kitchen" 
                : "Join Kitchen"
            }
          </button>
        </form>

        {/* Skip Option */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
