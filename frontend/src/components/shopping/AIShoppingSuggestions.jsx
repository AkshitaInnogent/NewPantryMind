// frontend/src/components/shopping/AIShoppingSuggestions.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '../ui';
import { Brain, TrendingUp, Sparkles } from 'lucide-react';
import { addItemToList } from '../../features/shopping/shoppingThunks';
import api from '../../services/api';

export function AIShoppingSuggestions({ kitchenId, currentListId }) {
  const dispatch = useDispatch();
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [consumptionAnalysis, setConsumptionAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const fetchAISuggestions = async () => {
    if (!kitchenId) return;
    
    setAiLoading(true);
    try {
      const response = await api.post('/ai/shopping-suggestions', { kitchenId });
      setAiSuggestions(response.data);
    } catch (error) {
      // Failed to fetch AI suggestions
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchConsumptionAnalysis = async () => {
    if (!kitchenId) return;
    
    try {
      const response = await api.post('/ai/analyze-consumption', { kitchenId });
      setConsumptionAnalysis(response.data);
    } catch (error) {
      // Failed to fetch consumption analysis
    }
  };

  useEffect(() => {
    if (kitchenId) {
      fetchAISuggestions();
      fetchConsumptionAnalysis();
    }
  }, [kitchenId]);

  const handleAddAISuggestion = async (suggestion) => {
    await dispatch(addItemToList({
      canonicalName: suggestion.canonicalName,
      suggestedQuantity: suggestion.suggestedQuantity,
      shoppingListId: currentListId,
      suggestedBy: 'AI',
      suggestionReason: suggestion.suggestionReason
    }));
  };

  if (!aiSuggestions.length && !aiLoading) return null;

  return (
    <div className="space-y-4">
      {/* AI Suggestions */}
      <Card className="p-4 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">AI Smart Suggestions</h3>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAISuggestions}
            disabled={aiLoading}
            className="border-purple-300 text-purple-600 hover:bg-purple-100"
          >
            {aiLoading ? 'Analyzing...' : 'Refresh AI'}
          </Button>
        </div>

        {aiLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-purple-600 mt-2">AI is analyzing your pantry...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg border p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.canonicalName}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        AI Powered
                      </span>
                      {suggestion.confidenceScore && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {Math.round(suggestion.confidenceScore * 100)}% confident
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Suggested: {suggestion.suggestedQuantity} units
                    </div>
                    <div className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
                      🤖 {suggestion.suggestionReason}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddAISuggestion(suggestion)}
                    className="ml-3 bg-purple-500 hover:bg-purple-600"
                  >
                    Add to List
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Consumption Analysis */}
      {consumptionAnalysis && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Consumption Insights</h4>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="border-green-300 text-green-600 hover:bg-green-100"
            >
              {showAnalysis ? 'Hide' : 'Show'} Analysis
            </Button>
          </div>

          {showAnalysis && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{consumptionAnalysis.totalItems}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-orange-600">{consumptionAnalysis.lowStockCount}</div>
                  <div className="text-sm text-gray-600">Low Stock</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((consumptionAnalysis.efficiency || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Efficiency</div>
                </div>
              </div>
              
              {consumptionAnalysis.insights && (
                <div className="mt-3">
                  <h5 className="font-medium text-green-800 mb-2">AI Insights:</h5>
                  <ul className="space-y-1">
                    {consumptionAnalysis.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
