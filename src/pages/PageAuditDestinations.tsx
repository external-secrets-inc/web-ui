import AuditDestinationDataTable from "@/components/Audit/AuditDestinationDataTable";
import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";
import useOrgLink from "@/hooks/useOrgLink";
import { Link } from "react-router-dom";

export function PageAuditDestinations() {
  const getOrglink = useOrgLink();
  return (
    <LayoutPage
      title="Destinations"
      description={
        <>
          Create and manage destination points for Triggers set under any of
          your existing <Link to={getOrglink("/audit/policies")}>Policies</Link>
          .
        </>
      }
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditDestinationDataTable />
    </LayoutPage>
  );
}
