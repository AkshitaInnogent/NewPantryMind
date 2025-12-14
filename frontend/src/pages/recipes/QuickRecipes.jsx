import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateQuickRecipes } from "../../features/recipes/recipeThunks";
import { clearRecipe, clearError } from "../../features/recipes/recipeSlice";
import PageLayout from "../../components/layout/PageLayout";
import { Button, LoadingSpinner, Card } from "../../components/ui";
import { showToast } from "../../utils/toast";
import { Zap, Clock, Users, Plus, Minus, Timer, ArrowLeft } from "lucide-react";

export default function QuickRecipes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { recipe, loading, error } = useSelector((state) => state.recipes);
  const [generating, setGenerating] = useState(false);
  const [servings, setServings] = useState(4);
  const [maxTime, setMaxTime] = useState(30);

  const handleGenerateRecipes = async () => {
    console.log('🚀 [FRONTEND] Quick Recipe Generation Started');
    console.log('📋 [FRONTEND] Parameters:', { kitchenId: user?.kitchenId, maxTime, servings, userId: user?.id });
    
    if (!user?.kitchenId) {
      console.error('❌ [FRONTEND] No kitchen ID found');
      return;
    }
    
    setGenerating(true);
    dispatch(clearError());
    
    try {
      console.log('⏳ [FRONTEND] Dispatching generateQuickRecipes thunk...');
      const result = await dispatch(generateQuickRecipes(user.kitchenId, maxTime, servings, user.id));
      console.log('✅ [FRONTEND] Quick recipe generation completed:', result);
    } catch (err) {
      console.error('❌ [FRONTEND] Quick recipe generation failed:', err);
    } finally {
      setGenerating(false);
      console.log('🏁 [FRONTEND] Quick recipe generation process finished');
    }
  };

  const handleNewRecipes = () => {
    dispatch(clearRecipe());
    dispatch(clearError());
  };

  const adjustServings = (increment) => {
    const newServings = servings + increment;
    console.log('👥 [FRONTEND] Adjusting servings:', { current: servings, increment, new: newServings });
    if (newServings >= 1 && newServings <= 20) {
      setServings(newServings);
    }
  };

  const handleViewRecipe = (recipeItem) => {
    console.log('👁️ [FRONTEND] Viewing recipe:', recipeItem.name);
    console.log('📊 [FRONTEND] Recipe details:', recipeItem);
    navigate('/recipe-detail', {
      state: {
        recipe: recipeItem,
        servings: servings
      }
    });
  };



  return (
    <PageLayout
      title="Quick Recipes"
      subtitle="Fast and delicious meals in minutes"
      icon={<Zap className="w-6 h-6" />}
      headerActions={recipe && (
        <Button variant="secondary" onClick={handleNewRecipes}>
          New Recipes
        </Button>
      )}
    >
      {!recipe && !loading && (
        <div className="text-center py-16">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Fast & Easy Cooking
          </span>
          
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
            <Zap className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 mb-4">
            Cook <span className="text-green-600">Quick Meals</span> in Minutes
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Perfect for busy schedules! Get recipes that can be prepared quickly with minimal prep time. 
            Set your time limit and we'll find the perfect quick recipes for you.
          </p>
          
          {/* Time Selector */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-6">
              Maximum cooking time?
            </label>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-3 px-8 py-4 bg-green-50 rounded-xl border-2 border-green-100">
                <Timer className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-extrabold text-green-600">{maxTime}</span>
                <span className="text-green-600 font-semibold">minutes</span>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={maxTime}
              onChange={(e) => {
                const newTime = parseInt(e.target.value);
                console.log('⏰ [FRONTEND] Max time changed:', { old: maxTime, new: newTime });
                setMaxTime(newTime);
              }}
              className="w-full max-w-md h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 max-w-md mx-auto mt-2">
              <span>10 min</span>
              <span>30 min</span>
              <span>60 min</span>
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
            {generating ? "Finding Quick Recipes..." : `Generate ${maxTime}-Minute Recipes`}
          </Button>
          
          {!user?.kitchenId && (
            <p className="text-sm text-red-600 mb-4">Please set up your kitchen first</p>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Fast cooking • Minimal prep • Perfect for busy days</span>
          </div>
        </div>
      )}

      {loading && (
        <LoadingSpinner 
          text="Finding Quick Recipe Ideas"
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
        console.log('🍳 [FRONTEND] Displaying recipes:', recipe),
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
                  Quick Recipes Ready
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  Fast Meals for <span className="text-green-600">{servings} People</span>
                </h2>
                <p className="text-gray-600">All recipes can be prepared in under {maxTime} minutes!</p>
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
                      <Zap className="w-4 h-4" />
                      Quick Recipe
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3">{recipeItem.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-green-700">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{recipeItem.cooking_time || `${maxTime} mins`}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" />
                      <span>{recipeItem.servings} servings</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="flex-grow space-y-4">
                  {/* Available Ingredients */}
                  {recipeItem.ingredients?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Timer className="w-4 h-4 text-green-600" />
                        Available Ingredients
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

                  {/* Fast Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Fast Steps</h4>
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
                    Cook in {recipeItem.cooking_time || `${maxTime} mins`}
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