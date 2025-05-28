import { useAuditContext } from "@/components/Audit/AuditContext";
import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import AuditPolicyDataTable from "@/components/Audit/AuditPolicyDataTable";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";
import useOrgLink from "@/hooks/useOrgLink";
import { IUserData } from "@/types";
import { LucideExternalLink } from "lucide-react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link } from "react-router-dom";

export function PageAuditPolicies() {
  const authUser = useAuthUser<IUserData>();
  const { auditListener } = useAuditContext();
  const docsLink = `${DOCS_DOMAIN}/docs/enterprise/audit/policies/quickstart`;
  const getOrglink = useOrgLink();
  
  return (
    <LayoutPage
      title="Policies"
      description={
        <>
          Create and manage Rego-based compliance policies for secrets, with
          automated triggers for policy-based actions across your{" "}
          <Link to={getOrglink("/audit/providers")}>Providers</Link>.
          <br />
          <a href={docsLink} target="_blank">
            Quickstart guide
            <LucideExternalLink className="inline ml-1" />
          </a>
        </>
      }
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditPolicyDataTable
        tenantID={authUser?.tenantId ?? ""}
        listenerID={auditListener?.listenerID ?? ""}
      />
    </LayoutPage>
  );
}
