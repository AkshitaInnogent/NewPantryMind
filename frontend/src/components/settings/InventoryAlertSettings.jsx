import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, Button, Input } from "../ui";

export default function InventoryAlertSettings({ inventory, onUpdate }) {
  const [form, setForm] = useState({
    minExpiryDaysAlert: inventory?.minExpiryDaysAlert || 3,
    minStock: inventory?.minStock || 250
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(inventory.id, form);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-orange-500" />
        <h3 className="font-medium">{inventory.name}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Alert Days
          </label>
          <Input
            type="number"
            name="minExpiryDaysAlert"
            value={form.minExpiryDaysAlert}
            onChange={handleChange}
            min="1"
            max="30"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when expiry is within this many days
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Stock
          </label>
          <Input
            type="number"
            name="minStock"
            value={form.minStock}
            onChange={handleChange}
            min="1"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when quantity falls below this amount
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          size="sm"
        >
          {loading ? "Updating..." : "Update Settings"}
        </Button>
      </form>
    </Card>
  );
}