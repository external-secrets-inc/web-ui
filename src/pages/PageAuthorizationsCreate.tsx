import { LayoutPage } from "@/components/layout";
import { AuthorizationCreate } from "@/components/workflows/Authorizations";

export function PageAuthorizationsCreate() {
  return (
    <LayoutPage
      title="Authorization"
      description="Create a new Authorization."
      width="compact"
    >
      <AuthorizationCreate />
    </LayoutPage>
  );
}
