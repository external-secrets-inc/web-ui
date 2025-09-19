import { ConsumerDataList } from "@/components/workflows/Consumers";
import { LayoutPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import useGetConsumers from "@/services/consumers/queries/useGetConsumers";
import { useMemo } from "react";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { Loader } from "@/components/ui/Loader";

export function PageConsumers() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["consumers", "useGetConsumers"] });
  };

  const {
    data: consumersData,
    isLoading: isLoadingConsumers,
    isError: isErrorConsumers,
    isRefetchError: isRefetchErrorConsumers,
    error: consumersError,
  } = useGetConsumers();

  const consumers = useMemo(() => {
    return consumersData || [];
  }, [consumersData]);

  if (isErrorConsumers || isRefetchErrorConsumers) {
    handleDefaultApiHttpError(
      consumersError,
      "Error while fetching Consumers data"
    );
  }

  return (
    <LayoutPage
      title="Consumers"
      description="Review consumers related to your reused secrets found across your targets."
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
      {isLoadingConsumers ? (
        <div className="flex justify-center items-center h-48">
          <Loader size="lg" />
        </div>
      ) : <ConsumerDataList consumers={consumers} />
      }
    </LayoutPage>
  );
}
