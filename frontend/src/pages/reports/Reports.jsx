import PageLayout from "../../components/layout/PageLayout";
import { EmptyState } from "../../components/ui";
import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <PageLayout
      title="Reports"
      subtitle="View detailed analytics"
      icon={<BarChart3 className="w-6 h-6" />}
    >
      <EmptyState
        icon={<BarChart3 className="w-10 h-10" />}
        title="View Detailed Reports"
        description="This page will contain detailed reports and analytics for your kitchen inventory."
      />
    </PageLayout>
  );
}