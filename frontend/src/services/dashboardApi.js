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