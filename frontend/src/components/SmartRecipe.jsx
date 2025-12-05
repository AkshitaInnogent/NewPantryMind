import React, { useState } from 'react';

const SmartRecipe = ({ recipe }) => {
  const [servings, setServings] = useState(recipe?.servings || 4);

  const adjustIngredient = (amount, originalServings) => {
    return ((amount * servings) / originalServings).toFixed(1);
  };

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Main Recipe Title */}
      <h1 className="recipe-title mb-2">
        {recipe?.title || 'Smart Recipe'}
      </h1>
      
      <p className="text-gray-600 mb-6">{recipe?.description}</p>

      {/* Recipe Info */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <h2 className="recipe-info-title mb-1">Prep Time</h2>
          <p className="text-green-600 font-medium">{recipe?.prepTime || '15 min'}</p>
        </div>
        <div className="text-center">
          <h2 className="recipe-info-title mb-1">Cook Time</h2>
          <p className="text-green-600 font-medium">{recipe?.cookTime || '30 min'}</p>
        </div>
        <div className="text-center">
          <h2 className="recipe-info-title mb-1">Servings</h2>
          <input 
            type="number" 
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            className="w-16 text-center border border-green-300 rounded px-2 py-1 text-green-600 font-medium"
            min="1"
          />
        </div>
      </div>

      {/* Ingredients Section */}
      <section className="mb-8">
        <h2 className="recipe-section-title mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe?.ingredients?.map((ingredient, index) => (
            <li key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 font-semibold min-w-[80px]">
                {adjustIngredient(ingredient.amount, recipe.servings)} {ingredient.unit}
              </span>
              <span className="text-gray-800">{ingredient.name}</span>
            </li>
          )) || (
            <li className="text-gray-500 italic">No ingredients available</li>
          )}
        </ul>
      </section>

      {/* Instructions Section */}
      <section className="mb-8">
        <h2 className="recipe-section-title mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe?.instructions?.map((step, index) => (
            <li key={index} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </span>
              <p className="text-gray-800 leading-relaxed pt-1">{step}</p>
            </li>
          )) || (
            <li className="text-gray-500 italic">No instructions available</li>
          )}
        </ol>
      </section>

      {/* Nutrition Section */}
      {recipe?.nutrition && (
        <section className="mb-8">
          <h2 className="recipe-section-title mb-4">Nutrition (per serving)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(recipe.nutrition).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-green-50 rounded-lg">
                <h3 className="recipe-nutrition-title capitalize">{key}</h3>
                <p className="text-green-600 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips Section */}
      {recipe?.tips && (
        <section>
          <h2 className="recipe-section-title mb-4">Chef's Tips</h2>
          <ul className="space-y-2">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-600 text-xl">💡</span>
                <p className="text-gray-800">{tip}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default SmartRecipe;