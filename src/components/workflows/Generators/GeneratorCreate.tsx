import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { GeneratorCreateWithYaml } from "./GeneratorCreateWithYaml";
import { GeneratorCreateWithEsiSchemaForm } from "./GeneratorCreateWithEsiSchemaForm";
import { LucideSquareCode, LucideTextCursorInput } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormMode = "yaml" | "form";

export function GeneratorCreate() {
  const [formMode, setFormMode] = useState<FormMode>("form");

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
        <GeneratorCreateWithYaml />
      ) : (
        <GeneratorCreateWithEsiSchemaForm />
      )}
    </>
  );
}