import React from 'react';
import SmartRecipe from './SmartRecipe';

const SmartRecipeDemo = () => {
  const sampleRecipe = {
    title: "Mediterranean Quinoa Bowl",
    description: "A healthy and delicious quinoa bowl packed with fresh vegetables and Mediterranean flavors",
    prepTime: "15 min",
    cookTime: "20 min",
    servings: 4,
    ingredients: [
      { amount: 1, unit: "cup", name: "quinoa, rinsed" },
      { amount: 2, unit: "cups", name: "vegetable broth" },
      { amount: 1, unit: "large", name: "cucumber, diced" },
      { amount: 2, unit: "medium", name: "tomatoes, chopped" },
      { amount: 0.5, unit: "cup", name: "red onion, finely diced" },
      { amount: 0.25, unit: "cup", name: "olive oil" },
      { amount: 2, unit: "tbsp", name: "lemon juice" },
      { amount: 0.5, unit: "cup", name: "feta cheese, crumbled" }
    ],
    instructions: [
      "Rinse quinoa under cold water until water runs clear.",
      "In a medium saucepan, bring vegetable broth to a boil. Add quinoa, reduce heat to low, cover and simmer for 15 minutes.",
      "Remove from heat and let stand 5 minutes. Fluff with a fork and let cool completely.",
      "In a large bowl, combine cooled quinoa, cucumber, tomatoes, and red onion.",
      "In a small bowl, whisk together olive oil and lemon juice. Season with salt and pepper.",
      "Pour dressing over quinoa mixture and toss to combine.",
      "Top with crumbled feta cheese and serve chilled or at room temperature."
    ],
    nutrition: {
      calories: "320",
      protein: "12g",
      carbs: "45g",
      fat: "11g"
    },
    tips: [
      "For extra flavor, toast the quinoa in a dry pan for 2-3 minutes before cooking.",
      "This bowl can be made ahead and stored in the refrigerator for up to 3 days.",
      "Add fresh herbs like parsley or mint for extra freshness."
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SmartRecipe recipe={sampleRecipe} />
    </div>
  );
};

export default SmartRecipeDemo;