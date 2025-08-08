import { LayoutPage } from "@/components/layout";
import { ServiceAccountCreate } from "@/components/workflows/ServiceAccounts";

export function PageServiceAccountsCreate() {
  return (
    <LayoutPage
      title="New Service Account"
      description="Create a new Workflow Service Account."
      width="compact"
    >
      <ServiceAccountCreate />
    </LayoutPage>
  );
}
