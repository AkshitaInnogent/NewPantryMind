import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Users, Settings, User, ChefHat, Utensils, BookOpen, Star } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const quickAction = {
    icon: <Home className="w-8 h-8" />,
    title: "Kitchen Setup",
    description: "Create your own kitchen or join an existing one with an invitation code",
    action: () => navigate("/kitchen-setup")
  };

  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: "Smart Inventory",
      description: "Track your pantry items with expiration alerts"
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Recipe Suggestions",
      description: "Get AI-powered recipes based on your ingredients"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "OCR Scanning",
      description: "Scan receipts to automatically add items"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Waste Analytics",
      description: "Track savings and reduce food waste"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center bg-green-100 text-green-700 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">Welcome to PantryMind</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Hello, {user?.name || user?.username}! 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your kitchen management with smart inventory tracking and AI-powered insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Kitchen Setup Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12 text-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Home className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
                  <p className="text-green-700">Join or create a kitchen to unlock all features</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Connect with your household members and start managing your pantry together. 
                Track expiration dates, get recipe suggestions, and reduce food waste.
              </p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Get Started with PantryMind
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Kitchen Setup */}
            <div
              onClick={quickAction.action}
              className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center h-full">
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center text-green-600 mb-6 mx-auto group-hover:scale-110 transition-transform">
                  {quickAction.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {quickAction.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {quickAction.description}
                </p>
                <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  Get Started
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div
              onClick={() => navigate("/profile")}
              className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center h-full">
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center text-green-600 mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Profile Settings
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Manage your account information and preferences
                </p>
                <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  Manage Profile
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              What You'll Get Access To
            </h2>
            <p className="text-gray-600">
              Powerful features to revolutionize your kitchen management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-green-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-green-900 rounded-2xl p-8 text-white">
            <span className="inline-block px-4 py-1 mb-4 rounded-full bg-green-700/50 text-sm">
              Start Waste-Free Journey
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-3">
              Ready to Transform Your Kitchen?
            </h3>
            <p className="text-green-200 mb-6 max-w-2xl mx-auto">
              Start reducing food waste, saving money, and cooking smarter with AI-powered pantry management.
            </p>
            <button
              onClick={() => navigate("/kitchen-setup")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}