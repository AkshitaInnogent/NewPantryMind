import api from './api';

const shoppingListService = {
  getShoppingList: async (kitchenId) => {
    const response = await api.get(`/shopping-list?kitchenId=${kitchenId}`);
    return response.data;
  },

  generateFromLowStock: async (kitchenId, threshold) => {
    const response = await api.post('/shopping-list/generate-from-low-stock', {
      kitchenId,
      threshold
    });
    return response.data;
  },

  addItem: async (itemData) => {
    const response = await api.post('/shopping-list', itemData);
    return response.data;
  },

  togglePurchased: async (itemId) => {
    const response = await api.put(`/shopping-list/${itemId}/toggle-purchased`);
    return response.data;
  },

  deleteItem: async (itemId) => {
    await api.delete(`/shopping-list/${itemId}`);
  },

  clearPurchasedItems: async (kitchenId) => {
    await api.delete(`/shopping-list/clear-purchased?kitchenId=${kitchenId}`);
  }
};

export default shoppingListService;
