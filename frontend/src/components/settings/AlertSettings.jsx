import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Bell, Save } from 'lucide-react';
import { Card } from '../ui';
import axiosClient from '../../services/api';
import { showToast } from '../../utils/toast';

const AlertSettings = () => {
  const { user } = useSelector(state => state.auth);
  const kitchenId = user?.kitchenId;
  const [settings, setSettings] = useState({
    alertTimeHour: 8,
    alertTimeMinute: 0,
    alertsEnabled: true
  });
  const [displayHour, setDisplayHour] = useState(8);
  const [ampm, setAmpm] = useState('AM');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (kitchenId) {
      fetchSettings();
    }
  }, [kitchenId]);

  useEffect(() => {
    // Convert 24-hour to 12-hour display
    let hour = settings.alertTimeHour;
    if (hour === 0) {
      setDisplayHour(12);
      setAmpm('AM');
    } else if (hour < 12) {
      setDisplayHour(hour);
      setAmpm('AM');
    } else if (hour === 12) {
      setDisplayHour(12);
      setAmpm('PM');
    } else {
      setDisplayHour(hour - 12);
      setAmpm('PM');
    }
  }, [settings.alertTimeHour]);

  const handleTimeChange = (hour, period) => {
    let hour24 = hour;
    if (period === 'AM' && hour === 12) hour24 = 0;
    else if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    
    setSettings({...settings, alertTimeHour: hour24});
  };

  const fetchSettings = async () => {
    if (!kitchenId) {
      console.log('Kitchen ID not available yet');
      return;
    }
    
    try {
      const response = await axiosClient.get(`/dashboard/settings/alerts?kitchenId=${kitchenId}`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch alert settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!kitchenId) {
      showToast.error('Kitchen not loaded yet, please try again');
      return;
    }
    
    setLoading(true);
    try {
      await axiosClient.put(`/dashboard/settings/alerts?kitchenId=${kitchenId}`, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save alert settings:', error);
      showToast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    let hour = settings.alertTimeHour;
    const minute = settings.alertTimeMinute.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    if (hour === 0) hour = 12;
    else if (hour > 12) hour = hour - 12;
    
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Bell className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Alert Settings</h2>
          <p className="text-sm text-gray-600">Configure when to receive inventory alerts</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
          <div className="flex items-center gap-3">
            <Bell className={`w-4 h-4 ${settings.alertsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">Enable Alerts</p>
              <p className="text-sm text-gray-600">Receive notifications for expiring items and low stock</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.alertsEnabled}
              onChange={(e) => setSettings({...settings, alertsEnabled: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Time Setting */}
        <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-green-600" />
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">Alert Time</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Hour:</label>
              <select
                value={displayHour}
                onChange={(e) => {
                  const newHour = parseInt(e.target.value);
                  setDisplayHour(newHour);
                  handleTimeChange(newHour, ampm);
                }}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                {Array.from({length: 12}, (_, i) => {
                  const hour = i + 1;
                  return <option key={hour} value={hour}>{hour}</option>
                })}
              </select>
            </div>
            
            <span className="text-gray-500 font-medium hidden sm:block">:</span>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Minute:</label>
              <select
                value={settings.alertTimeMinute}
                onChange={(e) => setSettings({...settings, alertTimeMinute: parseInt(e.target.value)})}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value={0}>00</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={ampm}
                onChange={(e) => {
                  const newAmpm = e.target.value;
                  setAmpm(newAmpm);
                  handleTimeChange(displayHour, newAmpm);
                }}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            
            <div className="mt-2 sm:mt-0 sm:ml-4 px-3 py-2 bg-green-50 text-green-700 rounded-md font-mono text-sm">
              {formatTime()}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
              saved 
                ? 'bg-green-600 text-white' 
                : loading 
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : saved ? (
              <>
                <div className="w-4 h-4 text-white">✓</div>
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AlertSettings;