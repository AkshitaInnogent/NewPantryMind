import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import kitchenReducer from "../features/kitchen/kitchenSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import memberReducer from "../features/members/memberSlice";
import categoryReducer from "../features/categories/categorySlice";
import unitReducer from "../features/units/unitSlice";
import locationReducer from "../features/locations/locationSlice";
import shoppingListReducer from "../features/shoppingList/shoppingListSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kitchen: kitchenReducer,
    inventory: inventoryReducer,
    members: memberReducer,
    categories: categoryReducer,
    units: unitReducer,
    locations: locationReducer,
    shoppingList: shoppingListReducer,
  },
});