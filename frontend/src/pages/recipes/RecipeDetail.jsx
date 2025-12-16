import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChefHat, Clock, Users, ArrowLeft, CheckCircle, ShoppingCart, Utensils, Timer, AlertCircle, Package } from "lucide-react";
import { showToast } from "../../utils/toast";
import { cookRecipe } from "../../features/inventory/inventoryThunks";

export default function RecipeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recipe, servings } = location.state || {};
  
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedShoppingItems, setCheckedShoppingItems] = useState({});
  const [checkedSteps, setCheckedSteps] = useState({});
  const [isCooked, setIsCooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false);
  const [itemsAddedToShoppingList, setItemsAddedToShoppingList] = useState(false);

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
      // Show success message
      showToast.success('Recipe cooked! Ingredients consumed and meal logged.');
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
                <CheckCircle className="w-5 h-5 text-green-600" />
                Available Ingredients
              </h2>

              
              <div className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {ingredient}
                    </span>
                  </div>
                ))}
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
                  {recipe.missing_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <ShoppingCart className="w-4 h-4 text-red-600" />
                      <span className="flex-1 text-sm font-medium text-gray-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={async () => {
                    if (!user?.id) {
                      showToast.error('Please log in to add items to shopping list');
                      return;
                    }
                    
                    setIsAddingToShoppingList(true);
                    
                    try {
                      // First get the shopping lists for the kitchen
                      const listsResponse = await fetch(`http://localhost:8080/api/shopping-lists/kitchen/${user.kitchenId}`);
                      const lists = await listsResponse.json();
                      
                      if (!lists || lists.length === 0) {
                        showToast.warning('No shopping list found. Please create one first.');
                        return;
                      }
                      
                      let addedCount = 0;
                      
                      // Add each missing item to a random shopping list
                      for (const item of recipe.missing_items) {
                        const [name, quantityUnit] = item.split(':');
                        const quantityMatch = quantityUnit?.match(/(\d+(?:\.\d+)?)/);
                        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
                        
                        // Pick a random list for each item
                        const randomListForItem = lists[Math.floor(Math.random() * lists.length)];
                        
                        const itemData = {
                          itemName: name.trim(),
                          quantity: quantity,
                          unitId: 1 // Default unit ID
                        };
                        
                        const response = await fetch(`http://localhost:8080/api/shopping-lists/${randomListForItem.id}/items?userId=${user.id}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(itemData)
                        });
                        
                        if (response.ok) {
                          addedCount++;
                        }
                      }
                      
                      if (addedCount > 0) {
                        showToast.success(`${addedCount} items added to shopping list successfully!`);
                        setItemsAddedToShoppingList(true);
                      } else {
                        showToast.error('Failed to add items to shopping list');
                      }
                    } catch (error) {
                      console.error('Failed to add items to shopping list:', error);
                      showToast.error('Failed to add items to shopping list. Please try again.');
                    } finally {
                      setIsAddingToShoppingList(false);
                    }
                  }}
                  disabled={isAddingToShoppingList || itemsAddedToShoppingList}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 ease-out ${
                    isAddingToShoppingList || itemsAddedToShoppingList
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-orange-500 hover:bg-orange-600 text-white hover:-translate-y-1 hover:scale-[1.02]'
                  }`}
                >
                  {isAddingToShoppingList ? 'Adding...' : itemsAddedToShoppingList ? 'Items Added' : 'Add All to Shopping List'}
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

              {/* Cooking Timer - akshitadidthisfor now */}
              {/* <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Timer className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Cooking Timer</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Total cooking time: {recipe.cooking_time || "30 mins"}
                </p>
                <button 
                  onClick={() => {
                    const time = recipe.cooking_time || "30 mins";
                    alert(`Timer started for ${time}! (Timer functionality coming soon)`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Timer
                </button>
              </div> */}

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
          
          {/* Save Recipe - akshitadidthisfor now */}
          {/* <button 
            onClick={() => {
              alert(`Recipe "${recipe.name}" saved to favorites! (Save feature coming soon)`);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
          >
            Save Recipe
          </button> */}
          
          {/* Share Recipe - akshitadidthisfor now */}
          {/* <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: recipe.name,
                  text: `Check out this recipe: ${recipe.name}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Recipe link copied to clipboard!');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
          >
            Share Recipe
          </button> */}
        </div>
      </div>
    </div>
  );
}
