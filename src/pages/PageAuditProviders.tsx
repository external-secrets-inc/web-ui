import { useAuditContext } from "@/components/Audit/AuditContext";
import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import AuditProviderDataTable from "@/components/Audit/AuditProviderDataTable";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";
import useOrgLink from "@/hooks/useOrgLink";
import { IUserData } from "@/types";
import { LucideExternalLink } from "lucide-react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link } from "react-router-dom";

export function PageAuditProviders() {
  const authUser = useAuthUser<IUserData>();
  const { auditListener } = useAuditContext();
  const docsLink = `${DOCS_DOMAIN}/docs/enterprise/audit/listener/providers/`;
  const getOrglink = useOrgLink();

  return (
    <LayoutPage
      title="Providers"
      description={
        <>
          Connect and manage your secrets Providers for the Audit Listener to
          monitor and enforce your compliance{" "}
          <Link to={getOrglink("/audit/policies")}>Policies</Link>.
          <br />
          <a href={docsLink} target="_blank">
            Setting up Providers
            <LucideExternalLink className="inline ml-1" />
          </a>
        </>
      }
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditProviderDataTable
        tenantID={authUser?.tenantId ?? ""}
        listenerID={auditListener?.listenerID ?? ""}
      />
    </LayoutPage>
  );
}
