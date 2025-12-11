import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

function MealLogs() {
  const { kitchenId } = useParams();
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealLogs = async () => {
      try {
        const response = await axiosClient.get(`/tracking/meal-logs/${kitchenId}`);
        setMealLogs(response.data);
      } catch (error) {
        console.error('Error fetching meal logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealLogs();
  }, [kitchenId]);

  if (loading) return <div>Loading meal logs...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Meal Logs</h2>
      {mealLogs.map(meal => (
        <div key={meal.id} className="mb-6 p-4 border rounded-lg shadow">
          <h3 className="text-xl font-semibold">{meal.mealName}</h3>
          <p>Type: {meal.mealType}</p>
          <p>Cooked on: {new Date(meal.cookedAt).toLocaleString()}</p>
          <p>Ingredients: {meal.ingredientsUsed}</p>
        </div>
      ))}
    </div>
  );
}

export default MealLogs;