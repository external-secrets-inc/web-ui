import { LayoutPage } from "@/components/layout";
import { FindingDetails } from "@/components/workflows/Findings";
import { useParams } from "react-router-dom";
import useGetFinding from "@/services/findings/queries/useGetFinding";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";

export function PageFindingDetails() {
  const { findingNamespace, findingName } = useParams();

  const {
    data: finding,
    isLoading,
    isError,
    error,
  } = useGetFinding(findingNamespace as string, findingName as string);

  if (isError) {
    if (error instanceof AxiosError) {
      handleDefaultApiHttpError(
        error as AxiosError<ApiHttpError>,
        "Error fetching finding details"
      );
    }
  }

  const handleAutomate = () => {
    // TODO[cfviotti]: AUTOMATE THIS SHIT 🤖💩
  };

  const title = isLoading ? (
    "Loading..."
  ) : isError ? (
    "Error"
  ) : !finding ? (
    "Not Found"
  ) : (
    <>
      Duplicated Secret: <span className="text-muted-foreground">{finding.name}</span>
    </>
  );

  return (
    <LayoutPage
      title={title}
      description="Review the details of a duplicated secret and automate their rotation with a Workflow."
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader size="lg" />
        </div>
      ) : isError ? (
        <div>Error loading finding details.</div>
      ) : !finding ? (
        <div>Finding not found.</div>
      ) : (
        <>
          <LayoutPortalTopbarActions>
            <Button onClick={handleAutomate}>Automate Rotation</Button>
          </LayoutPortalTopbarActions>
          <FindingDetails finding={finding} />
        </>
      )}
    </LayoutPage>
  );
}