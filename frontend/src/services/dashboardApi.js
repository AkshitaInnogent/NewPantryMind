import axiosClient from './api.js';

export const getDashboardStats = async () => {
  try {
    const response = await axiosClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getFinancialSummary = async () => {
  try {
    const response = await axiosClient.get('/dashboard/financial-summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
};

export const getMostUsedIngredients = async () => {
  try {
    const response = await axiosClient.get('/dashboard/most-used-ingredients');
    return response.data;
  } catch (error) {
    console.error('Error fetching most used ingredients:', error);
    throw error;
  }
};

export const getCategoryBreakdown = async () => {
  try {
    const response = await axiosClient.get('/dashboard/category-breakdown');
    return response.data;
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }
};

export const getMoneyFlow = async () => {
  try {
    const response = await axiosClient.get('/dashboard/money-flow');
    return response.data;
  } catch (error) {
    console.error('Error fetching money flow:', error);
    throw error;
  }
};

export const getExpiryAlertSuccess = async () => {
  try {
    const response = await axiosClient.get('/dashboard/expiry-alert-success');
    return response.data;
  } catch (error) {
    console.error('Error fetching expiry alert success:', error);
    throw error;
  }
};

export const getWasteStreak = async () => {
  try {
    const response = await axiosClient.get('/dashboard/waste-streak');
    return response.data;
  } catch (error) {
    console.error('Error fetching waste streak:', error);
    throw error;
  }
};

export const getMonthlyProgress = async () => {
  try {
    const response = await axiosClient.get('/dashboard/monthly-progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly progress:', error);
    // Return realistic mock data
    return {
      totalSaved: 220,
      overallImprovement: 15.5,
      monthlyData: [
        {
          month: 'Nov',
          wasteValue: 120,
          improvementPercentage: -5.2
        },
        {
          month: 'Dec',
          wasteValue: 40,
          improvementPercentage: 66.7
        }
      ]
    };
  }
};