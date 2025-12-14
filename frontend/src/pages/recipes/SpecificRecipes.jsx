import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateRecipes } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { ChefHat, Clock, Users, Plus, Minus, Package, ShoppingCart, ArrowLeft, Sparkles, Flame, Coffee, Sun, Salad, Moon, Snowflake } from "lucide-react";

const recipeCategories = [
  { id: 'sweet', name: 'Sweet Treats', icon: Sparkles, color: 'pink', description: 'Desserts, sweets & treats' },
  { id: 'spicy', name: 'Spicy Food', icon: Flame, color: 'red', description: 'Hot & spicy dishes' },
  { id: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'yellow', description: 'Morning meals' },
  { id: 'lunch', name: 'Lunch', icon: Sun, color: 'orange', description: 'Midday meals' },
  { id: 'dinner', name: 'Dinner', icon: Moon, color: 'purple', description: 'Evening meals' },
  { id: 'salads', name: 'Salads', icon: Salad, color: 'green', description: 'Fresh & healthy' },
  { id: 'seasonal', name: 'Seasonal', icon: Snowflake, color: 'blue', description: 'Seasonal specials' }
];

export default function SpecificRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = async (category) => {
    if (!user?.kitchenId) return;
    
    setSelectedCategory(category);
    setGenerating(true);
    dispatch(clearError());
    
    try {
      await dispatch(generateRecipes(user.kitchenId, servings, category.name));
    } catch (err) {
      console.error("Recipe generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleNewRecipes = () => {
    dispatch(clearRecipe());
    dispatch(clearError());
    setSelectedCategory(null);
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
      title="Specific Recipes"
      subtitle="Browse recipes by category and preference"
      icon={<ChefHat className="w-6 h-6" />}

    >
      {!recipe && !loading && (
        <div className="space-y-8">
          {/* Servings Selection */}
          <Card className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How many people?</h3>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => adjustServings(-1)}
                disabled={servings <= 1}
                className="w-12 h-12 rounded-full bg-blue-50 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{servings}</span>
              </div>
              
              <button
                onClick={() => adjustServings(1)}
                disabled={servings >= 20}
                className="w-12 h-12 rounded-full bg-blue-50 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Recipe Categories */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Choose Recipe Category</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipeCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => handleCategorySelect(category)}
                    disabled={generating || !user?.kitchenId}
                    className={`flex flex-col items-center gap-3 h-auto py-6 bg-white border-2 border-${category.color}-200 hover:bg-${category.color}-50 hover:border-${category.color}-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
                  >
                    <IconComponent className={`w-8 h-8 text-${category.color}-600`} />
                    <div className="text-center">
                      <span className="font-bold text-gray-900 block">{category.name}</span>
                      <span className="text-xs text-gray-600">{category.description}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text={`Finding ${selectedCategory?.name} Recipes for You`}
        />
      )}

      {error && (
        <Alert
          type="error"
          title="Recipe Generation Failed"
          message={error}
          onAction={() => selectedCategory && handleCategorySelect(selectedCategory)}
          actionText="Try Again"
        />
      )}

      {recipe && recipe.recipes && (
        <div className="space-y-8">
          {/* Results Header */}
          <Card className="text-center bg-green-50">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
              {selectedCategory?.name} Recipes Ready
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              Perfect {selectedCategory?.name} for <span className="text-green-600">{servings} People</span>
            </h2>
            <p className="text-gray-600">Choose your favorite and start cooking!</p>
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
                    <span className="text-sm text-green-600 font-medium">{selectedCategory?.name} Recipe</span>
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

                {/* Recipe Ingredients */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    Ingredients
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
                ← Browse Categories
              </Button>
              <Button
                onClick={() => handleCategorySelect(selectedCategory)}
                disabled={generating}
                loading={generating}
                className="flex items-center gap-2"
              >
                {generating ? "Generating..." : "Get More Recipes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}