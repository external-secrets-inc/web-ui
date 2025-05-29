import Audit from "@/components/Audit/Audit";
import { LayoutPage } from "@/components/layout";

export function PageAuditDashboard() {
  return (
    <LayoutPage
      title="Dashboard"
      description={
        <>
          Gather insights about your secrets and policies based on audit logs
          from multiple providers
        </>
      }
    >
      <Audit />
    </LayoutPage>
  );
}
