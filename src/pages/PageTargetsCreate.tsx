import { LayoutPage } from "@/components/layout";
import { TargetCreate } from "@/components/workflows/Targets";

export function PageTargetsCreate() {
  return (
    <LayoutPage
      title="New Target"
      description="Create a new Target."
      width="compact"
    >
      <TargetCreate />
    </LayoutPage>
  );
}