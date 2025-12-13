import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateRecipes, generateRecipeByName } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { ChefHat, Clock, Users, Plus, Minus, Package, ShoppingCart, Zap, AlertTriangle, Recycle, Settings } from "lucide-react";

export default function SmartRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast.error("Failed to generate recipe. Please try again.");
    }
  }, [error]);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);

  const [recipeName, setRecipeName] = useState("");

  const handleGenerateRecipes = async () => {
    if (!user?.kitchenId) {
      console.warn("⚠️ [FRONTEND] No kitchenId found for user:", user);
      return;
    }
    
    console.log("👨🍳 [FRONTEND] User clicked Generate Recipes button");
    console.log("🏠 [FRONTEND] User data:", { userId: user.id, kitchenId: user.kitchenId, role: user.role });
    console.log("👥 [FRONTEND] Servings:", servings);
    
    setGenerating(true);
    dispatch(clearError());
    
    try {
      const result = await dispatch(generateRecipes(user.kitchenId, servings));
      console.log("🎉 [FRONTEND] Recipe generation successful!", result);
    } catch (err) {
      console.error("😱 [FRONTEND] Recipe generation failed in component:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleNewRecipes = () => {
    dispatch(clearRecipe());
    dispatch(clearError());
  };

  const handleSearchRecipe = async () => {
    if (!user?.kitchenId || !recipeName.trim()) return;
    
    console.log("🔍 [FRONTEND] Searching for recipe:", recipeName);
    setGenerating(true);
    dispatch(clearError());
    
    try {
      await dispatch(generateRecipeByName(user.kitchenId, recipeName.trim(), servings));
      console.log("🎉 [FRONTEND] Recipe search successful!");
    } catch (err) {
      console.error("😱 [FRONTEND] Recipe search failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const adjustServings = (increment) => {
    const newServings = servings + increment;
    if (newServings >= 1 && newServings <= 20) {
      setServings(newServings);
    }
  };

  const handleViewRecipe = (recipeItem) => {
    navigate('/recipe-detail', {
      state: {
        recipe: recipeItem,
        servings: servings
      }
    });
  };

  return (
    <PageLayout
      title="Smart Recipes"
      subtitle="AI-powered recipe suggestions from your pantry"
      icon={<ChefHat className="w-6 h-6" />}
      headerActions={recipe && (
        <Button variant="secondary" onClick={handleNewRecipes}>
          New Recipes
        </Button>
      )}
    >
      {!recipe && !loading && (
        <div className="text-center py-16">
          
          {/* Recipe Type Options */}
          <div className="bg-green-50 rounded-xl p-8 mb-12">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              Recipe Categories
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
              Choose Your <span className="text-green-600">Recipe Type</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div
                onClick={() => navigate('/recipes/expiry')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border-2 border-orange-200 hover:border-orange-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900">Expiry Recipes</span>
                <span className="text-sm text-gray-600">Use expiring items first</span>
              </div>
              
              <div
                onClick={() => navigate('/recipes/quick')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border-2 border-green-200 hover:border-green-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900">Quick Recipes</span>
                <span className="text-sm text-gray-600">Ready in minutes</span>
              </div>
              
              <div
                onClick={() => navigate('/recipes/specific')}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border-2 border-green-200 hover:border-green-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
                  <ChefHat className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900">Specific Recipes</span>
                <span className="text-sm text-gray-600">Sweet, spicy, seasonal & more</span>
              </div>
            </div>
          </div>
          
          {/* Search Recipe Interface */}
          <div>
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                Search for specific recipe
              </span>
              
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
                <ChefHat className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-4">
                What do you want to <span className="text-green-600">cook today?</span>
              </h2>
              
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Type the name of any recipe and we'll show you how to make it with your available ingredients
              </p>

              {/* Recipe Search Input */}
              <div className="max-w-md mx-auto mb-8">
                <input
                  type="text"
                  placeholder="e.g., Matar Paneer, Biryani, Pasta..."
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchRecipe()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg transition-all"
                />
              </div>

              {/* Servings for Search */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  How many people?
                </label>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => adjustServings(-1)}
                    disabled={servings <= 1}
                    className="w-12 h-12 rounded-full bg-green-50 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:shadow-md"
                  >
                    <Minus className="w-5 h-5 text-green-600" />
                  </button>
                  
                  <div className="flex items-center gap-3 px-6 py-3 bg-green-50 rounded-xl">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{servings}</span>
                  </div>
                  
                  <button
                    onClick={() => adjustServings(1)}
                    disabled={servings >= 20}
                    className="w-12 h-12 rounded-full bg-green-50 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:shadow-md"
                  >
                    <Plus className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleSearchRecipe}
                disabled={generating || !recipeName.trim() || !user?.kitchenId}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold shadow transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {generating ? "Searching Recipe..." : "Get Recipe"}
              </button>
          </div>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text="Generating Your Personalized Recipes"
        />
      )}



      {recipe && recipe.recipes && (
        <div className="space-y-8">
          {/* Results Header */}
          <Card className="text-center bg-green-50">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
              Recipe Suggestions Ready
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
               Perfect Recipes for <span className="text-green-600">{servings} People</span>
            </h2>
            <p className="text-gray-600">Choose your favorite and start cooking with ingredients you already have!</p>
          </Card>

          {/* Recipes Grid */}
          <div className={`grid gap-6 ${recipe.recipes.length === 1 ? '' : 'md:grid-cols-2'}`}>
            {recipe.recipes.map((recipeItem, index) => (
              <Card key={index} hover className={`flex flex-col h-full ${recipe.recipes.length === 1 ? 'max-w-lg mx-auto' : ''}`}>
                {/* Recipe Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm text-green-600 font-medium">Recipe Option</span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3">{recipeItem.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>{recipeItem.cooking_time || "30 mins"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-green-700">
                      <Users className="w-4 h-4" />
                      <span>{recipeItem.servings} servings</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Ingredients Required */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Recipe Ingredients
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {recipeItem.ingredients?.slice(0, 3).map((ingredient, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                          {ingredient}
                        </li>
                      ))}
                      {recipeItem.ingredients?.length > 3 && (
                        <li className="text-sm text-green-600 font-medium">
                          +{recipeItem.ingredients.length - 3} more ingredients
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Need to Buy */}
                {recipeItem.missing_items?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-orange-600" />
                      Need to Buy
                    </h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {recipeItem.missing_items.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                            {item}
                          </li>
                        ))}
                        {recipeItem.missing_items.length > 2 && (
                          <li className="text-sm text-orange-600 font-medium">
                            +{recipeItem.missing_items.length - 2} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Steps Preview */}
                <div className="mb-6 flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Cooking Steps
                  </h4>
                  <ol className="space-y-3">
                    {recipeItem.steps?.slice(0, 2).map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                    {recipeItem.steps?.length > 2 && (
                      <li className="text-sm text-blue-600 font-medium ml-9">
                        +{recipeItem.steps.length - 2} more steps
                      </li>
                    )}
                  </ol>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  <Button 
                    onClick={() => handleViewRecipe(recipeItem)}
                    className="w-full"
                  >
                    View Full Recipe
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center pt-8 border-t border-gray-200">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleNewRecipes}
                className="flex items-center gap-2"
              >
                ← New Search
              </Button>
              <Button
                onClick={() => {
                  if (recipeName.trim()) {
                    handleSearchRecipe();
                  } else {
                    handleGenerateRecipes();
                  }
                }}
                disabled={generating || !user?.kitchenId}
                loading={generating}
                className="flex items-center gap-2"
              >
                {generating ? "Regenerating..." : recipeName.trim() ? "Search Again" : "Generate New Recipes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}