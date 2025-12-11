import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserPreferences, updateUserPreferences } from "../../features/preferences/preferencesThunks";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { Settings, ChefHat, Clock, Flame, ArrowLeft } from "lucide-react";

export default function RecipePreferences() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { preferences, loading, error } = useSelector((state) => state.preferences);
  
  const [formData, setFormData] = useState({
    skillLevel: "INTERMEDIATE",
    maxCookingTime: 45,
    spiceLevel: "MEDIUM",
    dietaryRestrictions: [],
    cuisinePreferences: [],
    avoidIngredients: []
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserPreferences(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (preferences) {
      setFormData({
        skillLevel: preferences.skillLevel || "INTERMEDIATE",
        maxCookingTime: preferences.maxCookingTime || 45,
        spiceLevel: preferences.spiceLevel || "MEDIUM",
        dietaryRestrictions: preferences.dietaryRestrictions || [],
        cuisinePreferences: preferences.cuisinePreferences || [],
        avoidIngredients: preferences.avoidIngredients || []
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      await dispatch(updateUserPreferences(user.id, formData));
      setShowSuccess(true);
      
      // Auto-hide success message and navigate after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/recipes');
      }, 2000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/recipes');
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  if (loading) return <LoadingSpinner text="Loading preferences..." />;

  return (
    <PageLayout
      title="Recipe Preferences"
      subtitle="Customize your cooking experience"
      icon={<Settings className="w-6 h-6" />}
      headerActions={
        <Button variant="secondary" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {error && (
          <Alert type="error" title="Error" message={error} />
        )}

        {showSuccess && (
          <Alert 
            type="success" 
            title="Preferences Saved!" 
            message="Your recipe preferences have been updated successfully. Redirecting to recipes..." 
          />
        )}

        {/* Skill Level */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Cooking Skill Level</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
              <button
                key={level}
                onClick={() => setFormData(prev => ({ ...prev, skillLevel: level }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.skillLevel === level
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{level}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {level === "BEGINNER" && "Simple 3-4 step recipes"}
                  {level === "INTERMEDIATE" && "Moderate complexity recipes"}
                  {level === "ADVANCED" && "Complex techniques welcome"}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Cooking Time */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Maximum Cooking Time</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">{formData.maxCookingTime} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={formData.maxCookingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, maxCookingTime: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>15 min</span>
              <span>30 min</span>
              <span>45 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>
        </Card>

        {/* Spice Level */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Spice Level</h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {["MILD", "MEDIUM", "SPICY", "EXTRA_SPICY"].map((level) => (
              <button
                key={level}
                onClick={() => setFormData(prev => ({ ...prev, spiceLevel: level }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.spiceLevel === level
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{level.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {level === "MILD" && "Kid-friendly"}
                  {level === "MEDIUM" && "Balanced heat"}
                  {level === "SPICY" && "Good heat"}
                  {level === "EXTRA_SPICY" && "Very hot"}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Dietary Restrictions */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Dietary Restrictions</h3>
          
          <div className="grid md:grid-cols-3 gap-3">
            {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Low-Carb"].map((restriction) => (
              <button
                key={restriction}
                onClick={() => handleArrayChange("dietaryRestrictions", restriction)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.dietaryRestrictions.includes(restriction)
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {restriction}
              </button>
            ))}
          </div>
        </Card>

        {/* Cuisine Preferences */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Cuisine Preferences</h3>
          
          <div className="grid md:grid-cols-4 gap-3">
            {["Indian", "Chinese", "Italian", "Mexican", "Thai", "Mediterranean", "Japanese", "American"].map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleArrayChange("cuisinePreferences", cuisine)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.cuisinePreferences.includes(cuisine)
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipes
          </Button>
          
          <Button
            onClick={handleSave}
            loading={saving}
            size="lg"
            className="px-8"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}