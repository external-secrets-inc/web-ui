import { Loader } from "@/components/ui/Loader";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetWorkflowTemplate from "@/services/workflows/queries/useGetWorkflowTemplate";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { WorkflowTemplateData } from "./Workflows.interfaces";
import { WorkflowRunTemplateDataTable } from "./WorkflowRunTemplateDataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import YAML from "yaml";
import { LayoutPortalHeaderActions } from "@/components/layout";
import { CodeTextarea } from "@/components/ui/CodeTextarea";

export function WorkflowTemplateDetails() {
  const { templateNamespace, templateName } = useParams();

  const {
    data: workflowTemplateData,
    isLoading: isLoadingWorkflowTemplate,
    error: workflowTemplateError,
  } = useGetWorkflowTemplate(
    { namespace: templateNamespace ?? "", name: templateName ?? "" },
    {
      staleTime: 30000,
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
        name: templateName,
        namespace: templateNamespace,
        status: { status: "Unknown", reason: "No data" },
        manifest: "",
        parameters: [],
      } as WorkflowTemplateData;

    return workflowTemplateData;
  }, [workflowTemplateData, templateName, templateNamespace]);

  const { yamlString, specName, specVersion } = useMemo(() => {
    try {
      const parsed = JSON.parse(workflowTemplate.manifest || "{}");
      const yamlStr = YAML.stringify(parsed);
      return {
        yamlString: yamlStr,
        specName: parsed?.spec?.name ?? "Unknown name",
        specVersion: parsed?.spec?.version ?? "Unknown version",
      };
    } catch (error) {
      console.error("Failed to parse manifest", error);
      return {
        yamlString: "Invalid manifest format.",
        specName: "N/A",
        specVersion: "N/A",
      };
    }
  }, [workflowTemplate]);

  return isLoadingWorkflowTemplate ? (
    <Loader />
  ) : (
    <div>
      <LayoutPortalHeaderActions>
        <div>
          <span className="font-medium">Version: {specVersion}</span>
        </div>
      </LayoutPortalHeaderActions>
      <div className="mb-4">
        <h2 className="mb-2">{specName}</h2>
        <Accordion className="mb-4" type="single" collapsible>
          <AccordionItem value="details" className="space-y-4 text-sm">
            <AccordionTrigger className="font-bold text-base">
              Details
            </AccordionTrigger>
            <AccordionContent>
              {workflowTemplate.parameters.map((param) => (
                <div key={param.ID} className="mb-4">
                  <div className="font-semibold mb-2">
                    {param.name} {param.required ? "(Required)" : ""}
                  </div>
                  <div className="text-muted-foreground pl-4 border-l py-2 ml-4">
                    {param.description}
                  </div>
                  {param.defaultValue && (
                    <div className="text-muted-foreground pl-4 border-l py-2 ml-4">
                      Default: {param.defaultValue}
                    </div>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manifest">
            <AccordionTrigger className="font-bold text-base">
              Manifest
            </AccordionTrigger>
            <AccordionContent>
                <CodeTextarea language="yaml" value={yamlString} disabled/>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <WorkflowRunTemplateDataTable />
      </div>
    </div>
  );
}
