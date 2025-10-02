import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import YAML from "yaml";
import { Button } from "@/components/ui/button";
import {
  EsiSchemaForm,
  type KubernetesManifest,
} from "@/components/EsiSchemaForm";
import { FieldSelect } from "@/components/ui/fields/FieldSelect";
import useCreateFederation from "@/services/federations/mutations/useCreateFederation";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

export function FederationCreateWithEsiSchemaForm() {
  const navigate = useNavigate();
  const [selectedFederationType, setSelectedFederationType] = useState<string>("");

  const form = useForm({
    defaultValues: {
      federationType: "",
    },
  });

  // Get federation types selection schema
  const { data: federationTypesSchema, isLoading: isLoadingTypes, error: typesError } = useGetUISchema("federations");

  // Extract options from the federation types schema
  const federationTypeOptions = federationTypesSchema?.fields?.find(field => field.id === "federations")?.options || [];

  // Get specific federation schema when a type is selected
  const resourcePath = selectedFederationType ? `federations/${selectedFederationType}` : "";
  const { data: schema, isLoading: isLoadingSchema, error: schemaError } = useGetUISchema(resourcePath, {
    enabled: !!selectedFederationType,
  });

  const { mutateAsync: createFederation, isPending } = useCreateFederation();

  const formId = "federation-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createFederation({ manifest: yamlContent });
  };

  const handleSuccess = () => {
    navigate("..");
  };

  const handleFederationTypeChange = (value: string | Record<string, unknown>) => {
    const stringValue = typeof value === 'string' ? value : '';
    setSelectedFederationType(stringValue);
    form.setValue("federationType", stringValue);
  };

  /**
   * Mock UISchemaField for the federation type selection.
   *
   * This component uses a hybrid approach: a standalone FieldSelect for federation
   * type selection, followed by a full EsiSchemaForm for the specific federation
   * configuration. The mock field enables the FieldSelect to use the same
   * interface and logic as schema-driven fields while remaining independent.
   *
   * @see FieldSelect - Requires a field prop of type UISchemaField
   * @see EsiSchemaForm - Used for the actual federation configuration after type selection
   */
  const mockField: UISchemaField = useMemo(() => ({
    id: "federationType",
    label: "Federation Type",
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
        Failed to load federation types. Please try again.
      </div>
    );
  }

  if (selectedFederationType && schemaError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema for {selectedFederationType}. Please try again.
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
            disabled={isPending || !selectedFederationType || !schema}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Federation
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <FormProvider {...form}>
          <FieldSelect
            field={mockField}
            name="federationType"
            label="Federation Type"
            description="Choose the type of federation you want to create. This will determine the available configuration options."
            required
            options={federationTypeOptions}
            placeholder="Select a federation type..."
            onValueChange={handleFederationTypeChange}
            descriptionInline
          />
        </FormProvider>

        {selectedFederationType && (
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
                  resourceType="federations"
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
