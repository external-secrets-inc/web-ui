import { LayoutPage } from "@/components/layout";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FindingDetails } from "@/components/workflows/Findings";
import {
  getDominantKey,
  getStoreNames,
} from "@/components/workflows/Findings/Findings.utils";
import { useSetBreadcrumb } from "@/components/layout/BreadcrumbsContext";
import useOrgLink from "@/hooks/useOrgLink";
import useGetFinding from "@/services/findings/queries/useGetFinding";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { LucideAsteriskSquare } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const CANDIDATE_SEPARATOR = "__SEPARATOR__";

export function PageFindingDetails() {
  const { findingNamespace = "", findingName = "" } = useParams<{
    findingNamespace: string;
    findingName: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

  const {
    data: finding,
    isLoading,
    isError,
    error,
  } = useGetFinding(findingNamespace, findingName);

  // For instant feedback on navigation, use the state if available.
  const immediateDominantKey = location.state?.dominantKey;

  // Once data loads, calculate the definitive dominant key.
  const loadedDominantKey = finding
    ? getDominantKey(finding) ?? finding.name
    : undefined;

  // The dynamic breadcrumb will be updated once loadedDominantKey is available.
  useSetBreadcrumb(location.pathname, loadedDominantKey);

  const dominantKey = immediateDominantKey || loadedDominantKey;

  if (isError) {
    if (error instanceof AxiosError) {
      handleDefaultApiHttpError(
        error as AxiosError<ApiHttpError>,
        "Error fetching finding details"
      );
    }
  }

  const handleAutomate = ({
    namespace,
    name,
  }: {
    namespace: string;
    name: string;
  }) => {
    const params = new URLSearchParams({
      finding: findingName ?? "",
    });

    navigate(
      getOrgLink(
        `/automation/workflows/${namespace}/${name}/create?${params.toString()}`
      )
    );
  };

  const title = dominantKey ? (
    <span className="flex items-center gap-2">
      <LucideAsteriskSquare className="size-6 text-muted-foreground" />{" "}
      {dominantKey}
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <LucideAsteriskSquare className="size-6 text-muted-foreground" />{" "}
      Reused Secret
    </span>
  );
  const description = (
    <>
      A Secret found reused{" "}
      <span className="font-bold text-foreground">
        {finding?.locations.length}
      </span>{" "}
      <span className="font-bold">
        {finding?.locations.length === 1 ? "time" : "times"}
      </span>{" "}
      across{" "}
      <span className="font-bold text-foreground">
        {finding?.locations ? getStoreNames(finding.locations).length : 0}
      </span>{" "}
      <span className="font-bold">
        {finding?.locations && getStoreNames(finding.locations).length === 1
          ? "location"
          : "locations"}
      </span>
      . <br /> Review where it's being reused and generate automation workflows
      to remediate it.
    </>
  );

  return (
    <LayoutPage title={title} description={description}>
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
                const workflowTemplateCandidate = value.split(
                  CANDIDATE_SEPARATOR,
                  2
                );
                if (workflowTemplateCandidate.length != 2) {
                  return;
                }

                return handleAutomate({
                  namespace: workflowTemplateCandidate[0],
                  name: workflowTemplateCandidate[1],
                });
              }}
            >
              <SelectTrigger className="w-48 max-w-full bg-primary text-primary-foreground shadow hover:bg-primary/90">
                <SelectValue>
                  <span>Automate Rotation</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {finding.workflowTemplateCandidates.map((candidate) => {
                  const namespace_name =
                    candidate.namespace + CANDIDATE_SEPARATOR + candidate.name;
                  return (
                    <SelectItem key={namespace_name} value={namespace_name}>
                      {candidate.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </LayoutPortalTopbarActions>
          <FindingDetails finding={finding} />
        </>
      )}
    </LayoutPage>
  );
}
