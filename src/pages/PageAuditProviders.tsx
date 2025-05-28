import { AuditHeaderActions } from "@/components/Audit/AuditHeaderActions";
import AuditProviderDataTable from "@/components/Audit/AuditProviderDataTable";
import { LayoutPage, LayoutPortalHeaderActions } from "@/components/layout";
import { IUserData } from "@/types";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export function PageAuditProviders() {
  const authUser = useAuthUser<IUserData>();

  return (
    <LayoutPage
      title="Providers"
      description="Manage credential providers and their connections to your secrets"
    >
      <LayoutPortalHeaderActions>
        <AuditHeaderActions />
      </LayoutPortalHeaderActions>
      <AuditProviderDataTable
        tenantID={authUser?.tenantId ?? ""}
        listenerID={authUser?.tenantId ?? ""}
      />
    </LayoutPage>
  );
}
