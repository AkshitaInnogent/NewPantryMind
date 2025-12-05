import PageLayout from "../../components/layout/PageLayout";
import { EmptyState } from "../../components/ui";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <PageLayout
      title="Settings"
      subtitle="Kitchen settings and preferences"
      icon={<SettingsIcon className="w-6 h-6" />}
    >
      <EmptyState
        icon={<SettingsIcon className="w-10 h-10" />}
        title="Kitchen Settings and Preferences"
        description="This page will contain kitchen settings and user preferences."
      />
    </PageLayout>
  );
}