import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateWastagePreventionRecipes } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { Recycle, Leaf, Users, Plus, Minus, TrendingDown, Package, ArrowLeft } from "lucide-react";

export default function WastagePreventionRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast.error("Failed to generate wastage prevention recipes. Please try again.");
    }
  }, [error]);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);

  const handleGenerateRecipes = async () => {
    if (!user?.kitchenId) return;
    
    setGenerating(true);
    dispatch(clearError());
    
    try {
      await dispatch(generateWastagePreventionRecipes(user.kitchenId, servings, user.id));
    } catch (err) {
      console.error("Wastage prevention recipe generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleNewRecipes = () => {
    dispatch(clearRecipe());
    dispatch(clearError());
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

  const handleBack = () => {
    navigate('/recipes');
  };

  return (
    <PageLayout
      title="Wastage Prevention Recipes"
      subtitle="Smart cooking to minimize food waste"
      icon={<Recycle className="w-6 h-6" />}
      headerActions={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipes
          </Button>
          {recipe && (
            <Button variant="secondary" onClick={handleNewRecipes}>
              New Recipes
            </Button>
          )}
        </div>
      }
    >
      {!recipe && !loading && (
        <div className="text-center py-16">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Zero Waste Cooking
          </span>
          
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
            <Recycle className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-4">
            <span className="text-green-600">Zero Waste</span> Smart Cooking
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Maximize your ingredients and minimize waste! Our AI creates recipes that use surplus items, 
            expiring ingredients, and helps you make the most of everything in your pantry.
          </p>
          
          {/* Benefits Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <TrendingDown className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Reduce Waste</h3>
              <p className="text-sm text-gray-600">Use expiring and surplus ingredients first</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Bulk Cooking</h3>
              <p className="text-sm text-gray-600">Recipes perfect for meal prep and storage</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <Leaf className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Eco-Friendly</h3>
              <p className="text-sm text-gray-600">Sustainable cooking practices</p>
            </div>
          </div>

          {/* Servings Selector */}
          <div className="mb-12">
            <label className="block text-lg font-semibold text-gray-900 mb-6">
              How many people are you cooking for?
            </label>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => adjustServings(-1)}
                disabled={servings <= 1}
                className="w-12 h-12 rounded-full bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl text-green-600"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 px-8 py-4 bg-green-50 rounded-xl border-2 border-green-100">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-extrabold text-green-600">{servings}</span>
                <span className="text-green-600 font-semibold">people</span>
              </div>
              
              <button
                onClick={() => adjustServings(1)}
                disabled={servings >= 20}
                className="w-12 h-12 rounded-full bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl text-green-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <Button
            size="xl"
            onClick={handleGenerateRecipes}
            disabled={generating || !user?.kitchenId}
            loading={generating}
            className="mb-4 bg-green-600 hover:bg-green-700"
          >
            {generating ? "Analyzing Pantry..." : "Generate Zero-Waste Recipes"}
          </Button>
          
          {!user?.kitchenId && (
            <p className="text-sm text-red-600 mb-4">Please set up your kitchen first</p>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Recycle className="w-4 h-4" />
            <span>Sustainable • Eco-friendly • Smart cooking</span>
          </div>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text="Analyzing Surplus & Expiring Items"
        />
      )}



      {recipe && recipe.recipes && (
        <div className="space-y-8">
          {/* Results Header */}
          <Card className="text-center bg-green-50 border-green-200">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
              Zero-Waste Recipes Ready
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              Smart Recipes for <span className="text-green-600">{servings} People</span>
            </h2>
            <p className="text-gray-600">These recipes maximize your ingredients and minimize waste!</p>
          </Card>

          {/* Recipes Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {recipe.recipes.map((recipeItem, index) => (
              <Card key={index} hover className="flex flex-col h-full border-l-4 border-green-500">
                {/* Recipe Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Recycle className="w-4 h-4" />
                      Zero Waste
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3">{recipeItem.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      <Package className="w-4 h-4" />
                      <span>{recipeItem.cooking_time || "35 mins"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-green-700">
                      <Users className="w-4 h-4" />
                      <span>{recipeItem.servings} servings</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="flex-grow space-y-4">
                  {/* Waste Prevention Benefits */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Waste Prevention Benefits</span>
                    </div>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Uses surplus and expiring ingredients</li>
                      <li>• Perfect for meal prep and storage</li>
                      <li>• Reduces food waste by up to 30%</li>
                    </ul>
                  </div>

                  {/* Using Surplus Items */}
                  {recipeItem.ingredients?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        Using Surplus Items
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {recipeItem.ingredients.slice(0, 3).map((ingredient, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              {ingredient}
                            </li>
                          ))}
                          {recipeItem.ingredients.length > 3 && (
                            <li className="text-sm text-green-600 font-medium">
                              +{recipeItem.ingredients.length - 3} more ingredients
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Smart Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Smart Cooking Steps</h4>
                    <ol className="space-y-2">
                      {recipeItem.steps?.slice(0, 2).map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                      {recipeItem.steps?.length > 2 && (
                        <li className="text-sm text-green-600 font-medium ml-9">
                          +{recipeItem.steps.length - 2} more steps
                        </li>
                      )}
                    </ol>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <Button 
                    onClick={() => handleViewRecipe(recipeItem)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Cook Zero-Waste Recipe
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Sustainability Tips */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Sustainability Tips</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">Storage Tips:</h4>
                <ul className="space-y-1">
                  <li>• Store leftovers in airtight containers</li>
                  <li>• Freeze portions for future meals</li>
                  <li>• Label with dates for easy tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Waste Reduction:</h4>
                <ul className="space-y-1">
                  <li>• Use vegetable scraps for stock</li>
                  <li>• Repurpose ingredients creatively</li>
                  <li>• Plan meals around expiring items</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}