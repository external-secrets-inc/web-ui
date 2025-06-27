import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { WorkflowRunTemplateCreateWithYaml } from "./WorkflowRunTemplateCreateWithYaml";
// import { WorkflowRunTemplateCreateWithEsiSchemaForm } from "./WorkflowRunTemplateCreateWithEsiSchemaForm";
import { LucideSquareCode, LucideTextCursorInput } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormMode = "yaml" | "form";

export function WorkflowRunTemplateCreate() {
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
        <Separator orientation="vertical" className="h-4" />
      </LayoutPortalTopbarActions>

      {formMode === "yaml" ? (
        <WorkflowRunTemplateCreateWithYaml />
      ) : (
        // <WorkflowRunTemplateCreateWithEsiSchemaForm />
        <p>Nothing yet</p>
      )}
    </>
  );
}
