import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import YAML from "yaml";
import { Button } from "@/components/ui/button";
import {
  EsiSchemaForm,
  type KubernetesManifest,
} from "@/components/EsiSchemaForm";
import { FieldSelect } from "@/components/ui/fields/FieldSelect";
import useCreateAuthorization from "@/services/federations/mutations/useCreateAuthorization";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { UISchemaField } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

export function AuthorizationCreateWithEsiSchemaForm() {
  const navigate = useNavigate();
  const [selectedAuthorizationType, setSelectedAuthorizationType] = useState<string>("");

  const form = useForm({
    defaultValues: {
      authorizationType: "",
    },
  });

  // Get authorization types selection schema
  const { data: authorizationTypesSchema, isLoading: isLoadingTypes, error: typesError } = useGetUISchema("authorizations");

  // Extract options from the authorization types schema
  const authorizationTypeOptions = authorizationTypesSchema?.fields?.find(field => field.id === "authorizations")?.options || [];

  // Get specific authorization schema when a type is selected
  const resourcePath = selectedAuthorizationType ? `authorizations/${selectedAuthorizationType}` : "";
  const { data: schema, isLoading: isLoadingSchema, error: schemaError } = useGetUISchema(resourcePath, {
    enabled: !!selectedAuthorizationType,
  });

  const { mutateAsync: createAuthorization, isPending } = useCreateAuthorization();

  const formId = "authorization-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createAuthorization({ manifest: yamlContent });
  };

  const handleSuccess = () => {
    navigate("..");
  };

  const handleAuthorizationTypeChange = (value: string | Record<string, unknown>) => {
    const stringValue = typeof value === 'string' ? value : '';
    setSelectedAuthorizationType(stringValue);
    form.setValue("authorizationType", stringValue);
  };

  /**
   * Mock UISchemaField for the authorization type selection.
   *
   * This component uses a hybrid approach: a standalone FieldSelect for authorization
   * type selection, followed by a full EsiSchemaForm for the specific authorization
   * configuration. The mock field enables the FieldSelect to use the same
   * interface and logic as schema-driven fields while remaining independent.
   *
   * @see FieldSelect - Requires a field prop of type UISchemaField
   * @see EsiSchemaForm - Used for the actual authorization configuration after type selection
   */
  const mockField: UISchemaField = useMemo(() => ({
    id: "authorizationType",
    label: "Authorization Type",
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
        Failed to load authorization types. Please try again.
      </div>
    );
  }

  if (selectedAuthorizationType && schemaError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema for {selectedAuthorizationType}. Please try again.
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
            disabled={isPending || !selectedAuthorizationType || !schema}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Authorization
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <FormProvider {...form}>
          <FieldSelect
            field={mockField}
            name="authorizationType"
            label="Authorization Type"
            description="Choose the type of authorization you want to create. This will determine the available configuration options."
            required
            options={authorizationTypeOptions}
            placeholder="Select a authorization type..."
            onValueChange={handleAuthorizationTypeChange}
            descriptionInline
          />
        </FormProvider>

        {selectedAuthorizationType && (
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
                  resourceType="authorizations"
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
