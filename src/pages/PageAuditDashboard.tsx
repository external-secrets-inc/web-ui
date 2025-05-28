import Audit from "@/components/Audit/Audit";
import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";

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
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <Audit />
    </LayoutPage>
  );
}
