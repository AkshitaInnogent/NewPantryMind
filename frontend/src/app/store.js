import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import kitchenReducer from "../features/kitchen/kitchenSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import memberReducer from "../features/members/memberSlice";
import categoryReducer from "../features/categories/categorySlice";
import unitReducer from "../features/units/unitSlice";
import locationReducer from "../features/locations/locationSlice";
import recipeReducer from "../features/recipes/recipeSlice";
import preferencesReducer from "../features/preferences/preferencesSlice";
import shoppingReducer from "../features/shopping/shoppingSlice";
import notificationReducer from "../features/notifications/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kitchen: kitchenReducer,
    inventory: inventoryReducer,
    members: memberReducer,
    categories: categoryReducer,
    units: unitReducer,
    locations: locationReducer,
    recipes: recipeReducer,
    preferences: preferencesReducer,
    shopping: shoppingReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
