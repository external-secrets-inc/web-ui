import { LayoutPage } from "@/components/layout";
import { FederationCreate } from "@/components/workflows/Federations";

export function PageFederationsCreate() {
  return (
    <LayoutPage
      title="New Identity Provider"
      description="Create a new Identity Provider."
      width="compact"
    >
      <FederationCreate />
    </LayoutPage>
  );
}
