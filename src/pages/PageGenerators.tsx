import { GeneratorDataTable } from "@/components/workflows/Generators";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageGenerators() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows", "useGetGenerators"] });
  };

  return (
    <LayoutPage
      title="Generators"
      description="Generators dynamically create credentials and secrets on demand based on your organization's policies."
    >
      <LayoutPortalTopbarActions>
        <Button
          variant="secondary"
          onClick={handleRefresh}
        >
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      <GeneratorDataTable />
    </LayoutPage>
  );
}