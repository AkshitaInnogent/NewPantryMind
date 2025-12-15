import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RxDashboard } from "react-icons/rx";
import { FiShoppingCart, FiUsers, FiCoffee } from "react-icons/fi";

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  const allMenuItems = [
    {
      title: "Dashboard",
      path: user?.role === "ADMIN" ? "/admin" : "/member",
      icon: <RxDashboard className="w-6 h-6" />,
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate(user?.role === "ADMIN" ? "/admin" : "/member")
    },
    {
      title: "Inventory",
      path: "/inventory",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/inventory")
    },
    {
      title: "Shopping List",
      path: "/shopping",
      icon: <FiShoppingCart className="w-6 h-6" />,
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/shopping")
    },
    {
      title: "Smart Recipes",
      path: "/recipes",
      icon: <FiCoffee className="w-6 h-6" />,
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/recipes")
    },
    {
      title: "Members",
      path: "/members",
      icon: <FiUsers className="w-6 h-6" />,
      roles: ["ADMIN"],
      onClick: () => navigate("/members")
    },
    {
      title: "Reports",
      path: "/reports",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ["ADMIN"],
      onClick: () => navigate("/reports")
    },
    {
      title: "Settings",
      path: "/settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      roles: ["ADMIN"],
      onClick: () => navigate("/settings")
    },
    {
      title: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/profile")
    }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getColorClasses = (path) => {
    const active = isActive(path);
    if (active) {
      return "bg-green-600 text-white border-green-600 shadow-xl transform scale-[1.02]";
    }
    return "bg-green-50 hover:bg-green-100 text-green-800 border-green-200 hover:border-green-300";
  };

  return (
    <div className="w-80 h-screen overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Menu
          </h2>
        </div>
        
        <div className="p-6 pt-4">
          <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${getColorClasses(item.path)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-current">{item.icon}</span>
                <h3 className="font-semibold text-base">{item.title}</h3>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}