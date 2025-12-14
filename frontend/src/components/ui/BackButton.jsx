import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";
import { clearRecipe } from "../../features/recipes/recipeSlice";

export default function BackButton({ className = "", fallbackPath = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  const handleBack = () => {
    // Clear recipe state if we're on a recipe page
    if (location.pathname.includes('/recipes/')) {
      dispatch(clearRecipe());
    }
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const defaultPath = fallbackPath || getDashboardPath(user?.role);
      navigate(defaultPath);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "MEMBER":
        return "/member";
      case "USER":
        return "/user";
      default:
        return "/";
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${className}`}
      title="Go back"
    >
      <FiArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}