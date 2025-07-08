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

export function WorkflowTemplateDetails({
  workflowTemplate,
  yamlString,
}: {
  workflowTemplate: WorkflowTemplateData;
  yamlString: string;
}) {
  return (
    <div>
      <div className="mb-4">
        <Accordion className="mb-4" type="single" collapsible>
          <AccordionItem value="details" className="space-y-4 text-sm">
            <AccordionTrigger className="font-bold text-base">
              Details
            </AccordionTrigger>
            <AccordionContent>
              {workflowTemplate.parameters?.map(
                (param: WorkflowTemplateParameter) => (
                  <div key={param.name} className="mb-4">
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
                )
              ) || (
                <div className="text-muted-foreground">
                  Failed to load details
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
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
