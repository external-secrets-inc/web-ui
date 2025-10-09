import {
  WorkflowTemplateData,
  WorkflowTemplateParameter,
} from "./Workflows.interfaces";
import { WorkflowRunTemplateDataTable } from "./WorkflowRunTemplateDataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import { DetailsCard } from "@/components/ui/DetailsCard";
import { LucideSettings2 } from "lucide-react";

export function WorkflowTemplateDetails({
  workflowTemplate,
  yamlString,
}: {
  workflowTemplate: WorkflowTemplateData;
  yamlString: string;
}) {
  const parameterFields = workflowTemplate.parameters?.map(
    (param: WorkflowTemplateParameter) => ({
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
    })
  ) || [];

  return (
    <div>
      <div className="space-y-6">
        {parameterFields.length > 0 ? (
          <DetailsCard
            icon={LucideSettings2}
            title="Parameters"
            fields={parameterFields}
          />
        ) : (
          <DetailsCard
            icon={LucideSettings2}
            title="Parameters"
          >
            <div className="text-muted-foreground italic">No parameters defined</div>
          </DetailsCard>
        )}

        <Accordion type="single" collapsible>
          <AccordionItem value="manifest">
            <AccordionTrigger className="font-bold text-base">
              Manifest Spec
            </AccordionTrigger>
            <AccordionContent>
              <CodeTextarea
                className="max-h-72 !overflow-auto"
                language="yaml"
                value={yamlString}
                disabled
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <WorkflowRunTemplateDataTable />
      </div>
    </div>
  );
}
