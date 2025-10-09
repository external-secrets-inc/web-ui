import { LayoutPage } from "@/components/layout";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import {
  WorkflowTemplateData,
  WorkflowTemplateDetails,
} from "@/components/workflows/Workflows";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetWorkflowTemplate from "@/services/workflows/queries/useGetWorkflowTemplate";
import { useQueryClient } from "@tanstack/react-query";
import { LucideRefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import YAML from "yaml";

// TODO[iurisevero]: Define Workflow manifest type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseManifest(manifest?: string): any {
  const raw = manifest || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return YAML.parse(raw);
    } catch (e) {
      console.error("Failed to parse manifest as JSON or YAML:", e);
      return {};
    }
  }
}

export function PageWorkflowTemplateDetails() {
  const queryClient = useQueryClient();
  const { templateNamespace, templateName } = useParams();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetWorkflowRunTemplates",
        `useGetWorkflowRunTemplates/${templateNamespace}/${templateName}`,
      ],
    });

    queryClient.invalidateQueries({
      queryKey: [
        "workflows",
        "useGetWorkflowTemplate",
        `useGetWorkflowTemplate/${templateNamespace}/${templateName}`,
      ],
    });
  };

  handleRefresh();

  const {
    data: workflowTemplateData,
    isLoading: isLoadingWorkflowTemplate,
    error: workflowTemplateError,
  } = useGetWorkflowTemplate(
    { namespace: templateNamespace ?? "", name: templateName ?? "" },
    {
      enabled: !!templateNamespace && !!templateName,
    }
  );

  useEffect(() => {
    if (workflowTemplateError) {
      handleDefaultApiHttpError(
        workflowTemplateError,
        `Error while fetching workflow run data`
      );
    }
  }, [workflowTemplateError]);

  const workflowTemplate = useMemo(() => {
    if (!workflowTemplateData)
      return {
        name: templateName ?? "",
        namespace: templateNamespace ?? "",
        status: { status: "Unknown", reason: "No data" },
        manifest: "",
        parameters: [],
        description: "",
        workflowRunTemplatesAmount: 0,
      } as WorkflowTemplateData;

    return workflowTemplateData;
  }, [workflowTemplateData, templateName, templateNamespace]);

  const { yamlString, specVersion } = useMemo(() => {
    try {
      const parsed = parseManifest(workflowTemplate.manifest);
      const yamlStr = YAML.stringify({ spec: parsed.spec || {} });
      return {
        yamlString: yamlStr,
        specVersion: parsed?.spec?.version ?? "Unknown version",
      };
    } catch (error) {
      console.error("Failed to parse manifest", error);
      return {
        yamlString: "Invalid manifest format.",
        specVersion: "N/A",
      };
    }
  }, [workflowTemplate]);

  return (
    <LayoutPage
      title={`${templateName}`}
      description={workflowTemplate.description}
    >
      <LayoutPortalTopbarActions>
        <Button variant="secondary" onClick={handleRefresh}>
          <LucideRefreshCw />
          Refresh Data
        </Button>
      </LayoutPortalTopbarActions>
      {isLoadingWorkflowTemplate ? (
        <Loader />
      ) : (
        <WorkflowTemplateDetails
          workflowTemplate={workflowTemplate}
          yamlString={yamlString}
          specVersion={specVersion}
        />
      )}
    </LayoutPage>
  );
}
