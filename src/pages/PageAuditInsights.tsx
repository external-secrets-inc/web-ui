import Audit from "@/components/Audit/Audit";
import { LayoutPage } from "@/components/layout";

export function PageAuditInsights() {
  return (
    <LayoutPage
      title="Audit Insights"
      description={
        <>
          Gather insights about your secrets and policies based on audit logs
          from multiple Providers
        </>
      }
    >
      <Audit />
    </LayoutPage>
  );
}
