import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChefHat, Clock, Users, ArrowLeft, CheckCircle, ShoppingCart, Utensils, Timer, AlertCircle, Package } from "lucide-react";
import { showToast } from "../../utils/toast";
import { cookRecipe } from "../../features/inventory/inventoryThunks";

export default function RecipeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { recipe, servings } = location.state || {};
  
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedShoppingItems, setCheckedShoppingItems] = useState({});
  const [checkedSteps, setCheckedSteps] = useState({});
  const [isCooked, setIsCooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
          <button 
            onClick={() => navigate('/recipes')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const handleCookRecipe = async () => {
    setIsLoading(true);
    try {
      await dispatch(cookRecipe(recipe));
      setIsCooked(true);
    } catch (error) {
      console.error('Failed to cook recipe:', error);
      showToast.error(error.message || 'Failed to cook recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleShoppingItem = (index) => {
    setCheckedShoppingItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleStep = (index) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/recipes')}
            className="w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-lg">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-1">
                Recipe Details
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900">{recipe.name}</h1>
            </div>
          </div>
        </div>

        {/* Recipe Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cooking Time</p>
                <p className="font-bold text-gray-900">{recipe.cooking_time || "30 mins"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-bold text-gray-900">{recipe.servings || servings} people</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-bold text-gray-900">Easy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recipe Ingredients */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Recipe Ingredients
              </h2>
              <p className="text-sm text-gray-600 mb-4">Exact quantities needed for this recipe:</p>
              
              <div className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => {
                  const displayText = ingredient;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        checkedIngredients[index] 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-green-50'
                      }`}
                      onClick={() => toggleIngredient(index)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkedIngredients[index] 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {checkedIngredients[index] && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`flex-1 text-sm font-medium ${checkedIngredients[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {displayText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopping List */}
            {recipe.missing_items?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  Shopping List
                </h2>
                <p className="text-sm text-gray-600 mb-4">Items you need to buy:</p>
                
                <div className="space-y-3 mb-4">
                  {recipe.missing_items.map((item, index) => {
                    const displayText = item;
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          checkedShoppingItems[index] 
                            ? 'bg-orange-50 border-orange-200' 
                            : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                        }`}
                        onClick={() => toggleShoppingItem(index)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          checkedShoppingItems[index] 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'border-orange-300'
                        }`}>
                          {checkedShoppingItems[index] && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`flex-1 text-sm font-medium ${checkedShoppingItems[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {displayText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]">
                  Add All to Shopping List
                </button>
              </div>
            )}
          </div>

          {/* Cooking Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Cooking Instructions
              </h2>

              <div className="space-y-4">
                {recipe.steps?.map((step, index) => (
                  <div 
                    key={index}
                    className={`border rounded-xl p-4 transition-all cursor-pointer ${
                      checkedSteps[index] 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        checkedSteps[index] 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border-2 border-blue-500 text-blue-500'
                      }`}>
                        {checkedSteps[index] ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`leading-relaxed ${checkedSteps[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cooking Timer */}
              <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Timer className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Cooking Timer</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Total cooking time: {recipe.cooking_time || "30 mins"}
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Start Timer
                </button>
              </div>

              {/* Tips Section */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Cooking Tips</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Measure all ingredients exactly as specified</li>
                  <li>• Prepare ingredients before starting to cook</li>
                  <li>• Keep heat at medium to avoid burning</li>
                  <li>• Taste and adjust seasoning as needed</li>
                  <li>• Let the dish rest for 2-3 minutes before serving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <button 
            onClick={() => navigate('/recipes')}
            className="border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
          >
            Back to Recipes
          </button>
          
          <button 
            onClick={handleCookRecipe}
            disabled={isCooked || isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
              isCooked || isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isLoading ? 'Cooking...' : isCooked ? 'Recipe Cooked!' : 'Cook Recipe'}
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]">
            Save Recipe
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]">
            Share Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
