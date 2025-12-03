import RightSidebar from "../../components/layout/RightSidebar";

export default function ShoppingList() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🛒 Shopping List
          </h1>
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Manage Your Shopping List
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Keep track of items you need to buy. Add items from your inventory or create custom shopping lists for your next grocery trip.
            </p>
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}