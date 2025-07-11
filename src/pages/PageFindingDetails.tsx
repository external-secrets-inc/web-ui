import { LayoutPage } from "@/components/layout";
import { FindingDetails } from "@/components/workflows/Findings";
import { useNavigate, useParams } from "react-router-dom";
import useGetFinding from "@/services/findings/queries/useGetFinding";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { Loader } from "@/components/ui/Loader";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useOrgLink from "@/hooks/useOrgLink";

export function PageFindingDetails() {
  const { findingNamespace, findingName } = useParams();
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

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

  const handleAutomate =({namespace, name} : {namespace: string, name: string}) => {
    const params = new URLSearchParams({
      finding: findingName?? ""
    });

    navigate(
      getOrgLink(
        `/workflows/templates/${namespace}/${name}/create?${params.toString()}`
      )
    );
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
            <Select

              value="Automate Rotation"
              onValueChange={(value) => {
                  const candidade = value.split("__SEPARATOR__", 2)
                  if(candidade.length != 2) {
                    return
                  }

                  return handleAutomate({namespace: candidade[0], name: candidade[1]})
                }
              }
            >
              <SelectTrigger className="w-48 max-w-full bg-primary text-primary-foreground shadow hover:bg-primary/90">
                <SelectValue>
                  <span>Automate Rotation</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {finding.workflowTemplateCandidates.map((candidate) => {
                    const namespace_name = candidate.namespace + "__SEPARATOR__" + candidate.name
                    return (
                      <SelectItem key={namespace_name} value={namespace_name}>
                        {candidate.name}
                      </SelectItem>
                    )
                  }
                )}
              </SelectContent>
            </Select>
          </LayoutPortalTopbarActions>
          <FindingDetails finding={finding} />
        </>
      )}
    </LayoutPage>
  );
}
