import PageLayout from "../../components/layout/PageLayout";
import InventoryStats from "../../components/dashboard/InventoryStats";
import { User } from "lucide-react";

export default function MemberDashboard() {
  return (
    <PageLayout
      title="Member Dashboard"
      subtitle="View inventory and manage your kitchen items"
      icon={<User className="w-6 h-6" />}
    >
      <InventoryStats />
    </PageLayout>
  );
}