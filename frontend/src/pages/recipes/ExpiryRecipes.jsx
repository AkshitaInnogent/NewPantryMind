import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateExpiryRecipes } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { Clock, AlertTriangle, Users, Plus, Minus, Leaf, ArrowLeft } from "lucide-react";

export default function ExpiryRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);

  const handleGenerateRecipes = async () => {
    if (!user?.kitchenId) return;
    
    console.log("🔍 [FRONTEND] Generating expiry recipes for kitchen:", user?.kitchenId);
    
    setGenerating(true);
    dispatch(clearError());
    
    try {
      const result = await dispatch(generateExpiryRecipes(user.kitchenId, servings, user.id));
      console.log("✅ [FRONTEND] Expiry recipes result:", result);
      
      if (result?.expiring_items_used) {
        console.log("🎯 [FRONTEND] Expiring items used:", result.expiring_items_used);
      }
    } catch (err) {
      console.error("❌ [FRONTEND] Expiry recipe generation failed:", err);
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



  return (
    <PageLayout
      title="Expiry-Based Recipes"
      subtitle="Prevent food waste with smart recipe suggestions"
      icon={<Clock className="w-6 h-6" />}
      headerActions={recipe && (
        <Button variant="secondary" onClick={handleNewRecipes}>
          New Recipes
        </Button>
      )}
    >
      {!recipe && !loading && (
        <div className="text-center py-16">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Prevent Food Waste
          </span>
          
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-4">
            Use <span className="text-green-600">Expiring Ingredients</span> First
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Our AI prioritizes ingredients that are about to expire, helping you reduce food waste 
            while creating delicious meals. Get recipes that use your expiring items first!
          </p>
          
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
            {generating ? "Finding Expiring Items..." : "Generate Waste-Prevention Recipes"}
          </Button>
          
          {!user?.kitchenId && (
            <p className="text-sm text-red-600 mb-4">Please set up your kitchen first</p>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Leaf className="w-4 h-4" />
            <span>Eco-friendly • Reduce waste • Save money</span>
          </div>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text="Analyzing Expiring Ingredients"
        />
      )}

      {error && (
        <Alert
          type="error"
          title="Recipe Generation Failed"
          message={error}
          onAction={handleGenerateRecipes}
          actionText="Try Again"
        />
      )}

      {recipe && recipe.recipes && (
        <div className="space-y-8">
          {/* Results Header */}
          <Card className={`text-center ${recipe.is_fallback ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            {recipe.is_fallback ? (
              <>
                <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
                  ⚠️ Fallback Recipe
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  Simple Recipe for <span className="text-orange-600">{servings} People</span>
                </h2>
                <p className="text-orange-600 mb-4">{recipe.fallback_reason}</p>
                <Button 
                  onClick={handleGenerateRecipes}
                  disabled={generating}
                  loading={generating}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {generating ? "Regenerating..." : "Try Regenerating Recipes"}
                </Button>
              </>
            ) : (
              <>
                <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
                  Waste Prevention Recipes Ready
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  Smart Recipes for <span className="text-green-600">{servings} People</span>
                </h2>
                <p className="text-gray-600">These recipes prioritize your expiring ingredients to prevent food waste!</p>
              </>
            )}
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
                      <AlertTriangle className="w-4 h-4" />
                      Waste Prevention
                    </span>
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

                {/* Recipe Content */}
                <div className="flex-grow space-y-4">
                  {/* Using Your Ingredients */}
                  {recipeItem.ingredients?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        Using Your Ingredients
                      </h4>
                      <div className="bg-green-50 rounded-lg p-4">
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

                  {/* Need to Buy */}
                  {recipeItem.missing_items?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🛒 Need to Buy
                      </h4>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <ul className="space-y-2">
                          {recipeItem.missing_items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-orange-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              {item}
                            </li>
                          ))}
                          {recipeItem.missing_items.length > 3 && (
                            <li className="text-sm text-orange-600 font-medium">
                              +{recipeItem.missing_items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Steps Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Steps</h4>
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
                    Cook This Recipe
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}