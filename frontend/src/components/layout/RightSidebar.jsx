import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RxDashboard } from "react-icons/rx";

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  const allMenuItems = [
    {
      title: "Dashboard",
      description: "Back to dashboard",
      path: user?.role === "ADMIN" ? "/admin" : "/member",
      icon: <RxDashboard className="w-6 h-6" />,
      color: "sky",
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate(user?.role === "ADMIN" ? "/admin" : "/member")
    },
    {
      title: "Inventory",
      description: "View and manage inventory",
      path: "/inventory",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "emerald",
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/inventory")
    },
    {
      title: "Shopping List",
      description: "Manage shopping items",
      path: "/shopping",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      color: "rose",
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/shopping")
    },
    {
      title: "Smart Recipes",
      description: "Cook with what I have",
      path: "/recipes",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "violet",
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/recipes")
    },
    {
      title: "Members",
      description: "Manage kitchen members",
      path: "/members",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: "amber",
      roles: ["ADMIN"],
      onClick: () => navigate("/members")
    },
    {
      title: "Reports",
      description: "View detailed reports",
      path: "/reports",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "cyan",
      roles: ["ADMIN"],
      onClick: () => navigate("/reports")
    },
    {
      title: "Settings",
      description: "Kitchen settings and preferences",
      path: "/settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "lime",
      roles: ["ADMIN"],
      onClick: () => navigate("/settings")
    },
    {
      title: "Profile",
      description: "User profile settings",
      path: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "slate",
      roles: ["ADMIN", "MEMBER"],
      onClick: () => navigate("/profile")
    }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getColorClasses = (color, path) => {
    const active = isActive(path);
    // Use green as primary theme with subtle variations for different sections
    if (active) {
      return "bg-green-600 text-white border-green-600 shadow-xl transform scale-[1.02]";
    }
    
    const colors = {
      sky: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200 hover:border-green-300",
      emerald: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200 hover:border-green-300", 
      rose: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300",
      violet: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300",
      amber: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300",
      cyan: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300",
      lime: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300",
      slate: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="w-80 p-6">
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${getColorClasses(item.color, item.path)}`}
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
  );
}