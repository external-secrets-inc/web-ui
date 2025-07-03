import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import YAML from "yaml";
import { Button } from "@/components/ui/button";
import {
  EsiSchemaForm,
  type KubernetesManifest,
} from "@/components/EsiSchemaForm";
import { FieldSelect } from "@/components/ui/fields/FieldSelect";
import useCreateGenerator from "@/services/workflows/mutations/useCreateGenerator";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function GeneratorCreateWithEsiSchemaForm() {
  const navigate = useNavigate();
  const [selectedGeneratorType, setSelectedGeneratorType] = useState<string>("");

  const form = useForm({
    defaultValues: {
      generatorType: "",
    },
  });

  // Get generator types selection schema
  const { data: generatorTypesSchema, isLoading: isLoadingTypes, error: typesError } = useGetUISchema("generators");

  // Extract options from the generator types schema
  const generatorTypeOptions = generatorTypesSchema?.fields?.find(field => field.id === "generators")?.options || [];

  // Get specific generator schema when a type is selected
  const resourcePath = selectedGeneratorType ? `generators/${selectedGeneratorType}` : "";
  const { data: schema, isLoading: isLoadingSchema, error: schemaError } = useGetUISchema(resourcePath, {
    enabled: !!selectedGeneratorType,
  });

  const { mutateAsync: createGenerator, isPending } = useCreateGenerator();

  const formId = "generator-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createGenerator({ manifest: yamlContent });
  };

  const handleSuccess = () => {
    navigate("..");
  };

  const handleGeneratorTypeChange = (value: string) => {
    setSelectedGeneratorType(value);
    form.setValue("generatorType", value);
  };

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
        Failed to load generator types. Please try again.
      </div>
    );
  }

  if (selectedGeneratorType && schemaError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema for {selectedGeneratorType}. Please try again.
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
            disabled={isPending || !selectedGeneratorType || !schema}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Generator
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <FormProvider {...form}>
          <FieldSelect
            name="generatorType"
            label="Generator Type"
            description="Choose the type of generator you want to create. This will determine the available configuration options."
            required
            options={generatorTypeOptions}
            placeholder="Select a generator type..."
            onValueChange={handleGeneratorTypeChange}
            descriptionInline
          />
        </FormProvider>

        {selectedGeneratorType && (
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
                  resourceType="generators"
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