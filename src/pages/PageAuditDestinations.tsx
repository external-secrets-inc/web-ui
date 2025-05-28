import AuditDestinationDataTable from "@/components/Audit/AuditDestinationDataTable";
import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";

export function PageAuditDestinations() {
  return (
    <LayoutPage
      title="Destinations"
      description="Manage destination points for your secrets"
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditDestinationDataTable />
    </LayoutPage>
  );
}
