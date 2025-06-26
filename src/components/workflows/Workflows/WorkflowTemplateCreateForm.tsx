import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { WorkflowTemplateCreateWithYaml } from "./WorkflowTemplateCreateWithYaml";
import { WorkflowTemplateCreateWithEsiSchemaForm } from "./WorkflowTemplateCreateWithEsiSchemaForm";
import { LucideSquareCode, LucideTextCursorInput } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormMode = "yaml" | "form";

export function WorkflowTemplateCreateForm() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const [formMode, setFormMode] = useState<FormMode>("form");

  const handleCancel = () => {
    navigate(getOrgLink("/workflows/templates"));
  };

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
        <WorkflowTemplateCreateWithYaml onCancel={handleCancel} />
      ) : (
        <WorkflowTemplateCreateWithEsiSchemaForm onCancel={handleCancel} />
      )}
    </>
  );
}
