import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { WorkflowTemplateCreateWithYaml } from "./WorkflowTemplateCreateWithYaml";
import { WorkflowTemplateCreateWithEsiSchemaForm } from "./WorkflowTemplateCreateWithEsiSchemaForm";
import { LucideSquareCode, LucideTextCursorInput } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormMode = "yaml" | "form";

export function WorkflowTemplateCreate() {
  const [formMode, setFormMode] = useState<FormMode>("yaml");

  return (
    <>
      <LayoutPortalTopbarActions>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={formMode}
          onValueChange={(value) => value && setFormMode(value as FormMode)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <ToggleGroupItem value="form">
                  <LucideTextCursorInput />
                </ToggleGroupItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Form Builder</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <ToggleGroupItem value="yaml">
                  <LucideSquareCode />
                </ToggleGroupItem>
              </span>
            </TooltipTrigger>
            <TooltipContent>Raw YAML Manifest</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </LayoutPortalTopbarActions>

      {formMode === "yaml" ? (
        <WorkflowTemplateCreateWithYaml />
      ) : (
        <>
          {/* TODO[cfviotti]: Remove this alert when the generated schema for Workflow Templates is fully implemented */}
          <Alert variant="warning" className="mb-6">
            <AlertTitle>Experimental Feature</AlertTitle>
            <AlertDescription className="font-medium">
              Form Builder for Workflows is experimental and may not
              work as expected. <br />
              Prefer to use the Raw YAML Manifest editor instead.
            </AlertDescription>
          </Alert>
          <WorkflowTemplateCreateWithEsiSchemaForm />
        </>
      )}
    </>
  );
}
