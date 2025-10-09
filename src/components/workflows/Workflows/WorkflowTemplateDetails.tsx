import { LayoutPortalHeaderActions } from "@/components/layout";
import { CodeViewerSheet } from "@/components/ui/CodeViewerSheet";
import { DetailsCard } from "@/components/ui/DetailsCard";
import { LucideInfo, LucideSettings2, LucideSquareCode } from "lucide-react";
import { WorkflowRunTemplateDataTable } from "./WorkflowRunTemplateDataTable";
import {
  WorkflowTemplateData,
  WorkflowTemplateParameter,
} from "./Workflows.interfaces";

export function WorkflowTemplateDetails({
  workflowTemplate,
  yamlString,
  specVersion,
}: {
  workflowTemplate: WorkflowTemplateData;
  yamlString: string;
  specVersion: string;
}) {
  const parameterFields =
    workflowTemplate.parameters?.map((param: WorkflowTemplateParameter) => ({
      label: `${param.name}${param.required ? " (Required)" : ""}`,
      value: (
        <div className="space-y-1">
          <div className="break-all">{param.description}</div>
          {param.defaultValue && (
            <div className="text-muted-foreground text-xs">
              Default: <span className="font-mono">{param.defaultValue}</span>
            </div>
          )}
        </div>
      ),
    })) || [];

  return (
    <>
      <LayoutPortalHeaderActions>
        <CodeViewerSheet
          code={yamlString}
          language="yaml"
          title="Manifest Spec"
          icon={<LucideSquareCode />}
          triggerLabel="View Manifest Spec"
          triggerIcon={<LucideSquareCode />}
          triggerVariant="secondary"
        />
      </LayoutPortalHeaderActions>

      <div>
        <div className="space-y-10">
          <DetailsCard
            icon={LucideInfo}
            title="Workflow Template Details"
            fields={[
              {
                label: "Version",
                value: specVersion,
              },
            ]}
            sections={
              parameterFields.length > 0
                ? [
                    {
                      title: "Parameters",
                      icon: LucideSettings2,
                      fields: parameterFields,
                    },
                  ]
                : undefined
            }
          >
            {parameterFields.length === 0 && (
              <>
                <div className="text-sm font-medium text-muted-foreground">
                  Parameters
                </div>
                <div className="text-muted-foreground italic text-sm">
                  No parameters defined
                </div>
              </>
            )}
          </DetailsCard>

          <WorkflowRunTemplateDataTable />
        </div>
      </div>
    </>
  );
}
