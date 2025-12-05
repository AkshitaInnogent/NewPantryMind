import PageLayout from "../../components/layout/PageLayout";
import { EmptyState } from "../../components/ui";
import { ShoppingCart } from "lucide-react";

export default function ShoppingList() {
  return (
    <PageLayout
      title="Shopping List"
      subtitle="Manage your shopping items"
      icon={<ShoppingCart className="w-6 h-6" />}
    >
      <EmptyState
        icon={<ShoppingCart className="w-10 h-10" />}
        title="Manage Your Shopping List"
        description="Keep track of items you need to buy. Add items from your inventory or create custom shopping lists for your next grocery trip."
      />
    </PageLayout>
  );
}