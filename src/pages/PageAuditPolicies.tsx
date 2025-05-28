import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import AuditPolicyDataTable from "@/components/Audit/AuditPolicyDataTable";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";
import { IUserData } from "@/types";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export function PageAuditPolicies() {
  const authUser = useAuthUser<IUserData>();

  return (
    <LayoutPage
      title="Policies"
      description="Manage access and control policies for your secrets"
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditPolicyDataTable
        tenantID={authUser?.tenantId ?? ""}
        listenerID={authUser?.tenantId ?? ""}
      />
    </LayoutPage>
  );
}
