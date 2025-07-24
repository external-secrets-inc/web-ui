import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import YAML from "yaml";
import { Button } from "@/components/ui/button";
import {
  EsiSchemaForm,
  type KubernetesManifest,
} from "@/components/EsiSchemaForm";
import { FieldSelect } from "@/components/ui/fields/FieldSelect";
import useCreateTarget from "@/services/workflows/mutations/useCreateTarget";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

export function TargetCreateWithEsiSchemaForm() {
  const navigate = useNavigate();
  const [selectedTargetType, setSelectedTargetType] = useState<string>("");

  const form = useForm({
    defaultValues: {
      targetType: "",
    },
  });

  // Get target types selection schema
  const { data: targetTypesSchema, isLoading: isLoadingTypes, error: typesError } = useGetUISchema("targets");

  // Extract options from the target types schema
  const targetTypeOptions = targetTypesSchema?.fields?.find(field => field.id === "targets")?.options || [];

  // Get specific target schema when a type is selected
  const resourcePath = selectedTargetType ? `targets/${selectedTargetType}` : "";
  const { data: schema, isLoading: isLoadingSchema, error: schemaError } = useGetUISchema(resourcePath, {
    enabled: !!selectedTargetType,
  });

  const { mutateAsync: createTarget, isPending } = useCreateTarget();

  const formId = "target-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createTarget({ manifest: yamlContent });
  };

  const handleSuccess = () => {
    navigate("..");
  };

  const handleTargetTypeChange = (value: string | Record<string, unknown>) => {
    const stringValue = typeof value === 'string' ? value : '';
    setSelectedTargetType(stringValue);
    form.setValue("targetType", stringValue);
  };

  /**
   * Mock UISchemaField for the target type selection.
   *
   * This component uses a hybrid approach: a standalone FieldSelect for target
   * type selection, followed by a full EsiSchemaForm for the specific target
   * configuration. The mock field enables the FieldSelect to use the same
   * interface and logic as schema-driven fields while remaining independent.
   *
   * @see FieldSelect - Requires a field prop of type UISchemaField
   * @see EsiSchemaForm - Used for the actual target configuration after type selection
   */
  const mockField: UISchemaField = useMemo(() => ({
    id: "targetType",
    label: "Target Type",
    type: "select",
    required: true,
  }), []);

  if (isLoadingTypes) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (typesError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load target types. Please try again.
      </div>
    );
  }

  if (selectedTargetType && schemaError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema for {selectedTargetType}. Please try again.
      </div>
    );
  }

  return (
    <>
      <LayoutPortalTopbarActions>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            asChild
          >
            <Link to="..">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            form={formId}
            disabled={isPending || !selectedTargetType}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Target
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <FormProvider {...form}>
          <FieldSelect
            field={mockField}
            name="targetType"
            label="Target Type"
            description="Choose the type of target you want to create. This will determine the available configuration options."
            required
            options={targetTypeOptions}
            placeholder="Select a target type..."
            onValueChange={handleTargetTypeChange}
            descriptionInline
          />
        </FormProvider>

        {selectedTargetType && (
          <>
            <Separator />
            <div className="space-y-4">

              {isLoadingSchema && (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              )}

              {schema && !isLoadingSchema && (
                <EsiSchemaForm
                  schema={schema}
                  resourceType="targets"
                  onSubmit={handleSubmit}
                  formId={formId}
                  disabled={isPending}
                  hideSubmitButton
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}