import { LayoutPage } from "@/components/layout";
import Settings from "@/components/Settings";

export function PageSettings() {
  return (
    <LayoutPage
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <Settings />
    </LayoutPage>
  );
}
