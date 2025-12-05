import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateRecipes } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Alert, Card } from "../../components/ui";
import { ChefHat, Clock, Users, Plus, Minus, Package, ShoppingCart } from "lucide-react";

export default function SmartRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);

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
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Cook with what you have
          </span>
          
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
            <ChefHat className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-4">
            Get <span className="text-green-600">4 Personalized</span> Recipe Suggestions
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Our AI analyzes your pantry ingredients and creates delicious recipes tailored to your available items. 
            Choose how many people you're cooking for and get instant suggestions!
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
            className="mb-4"
          >
            {generating ? "Generating 4 Recipes..." : "Generate 4 Smart Recipes"}
          </Button>
          
          {!user?.kitchenId && (
            <p className="text-sm text-red-600 mb-4">Please set up your kitchen first to get recipe suggestions</p>
          )}
          
          <p className="text-sm text-gray-400">
            Personalized recipes • Reduce food waste • Cook smarter
          </p>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text="Generating Your Personalized Recipes"
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
          <div className="grid md:grid-cols-2 gap-6">
            {recipe.recipes.map((recipeItem, index) => (
              <Card key={index} hover className="flex flex-col h-full">
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

          {/* Generate New Recipes */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Button
              size="xl"
              onClick={handleGenerateRecipes}
              disabled={generating}
              loading={generating}
              className="mb-4"
            >
              {generating ? "Generating..." : "Generate 4 New Recipes"}
            </Button>
            <p className="text-sm text-gray-400">
              Get fresh recipe ideas • Same ingredients, different flavors
            </p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}