import YAML from "yaml";
import { Button } from "@/components/ui/button";
import { EsiSchemaForm, parseManifestToFormValues, type KubernetesManifest } from "@/components/EsiSchemaForm";
import useUpdateSecretStore from "@/services/workflows/mutations/useUpdateSecretStore";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function SecretStoreEditWithEsiSchemaForm({ manifest } : { manifest: string}) {
  const navigate = useNavigate();

  const { data: schema, isLoading, error } = useGetUISchema("secretstore");
  const { mutateAsync: updateSecretStore, isPending } = useUpdateSecretStore();

  const formId = "secret-store-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await updateSecretStore({ manifest: yamlContent });
  };

  const handleSuccess = () => {
    navigate("..");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema. Please try again.
      </div>
    );
  }

  const parsedManifest = YAML.parse(manifest) as Record<string, unknown>;
  const initialValues = parseManifestToFormValues(parsedManifest, schema?.fields);

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
            disabled={isPending}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Edit Secret Store
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <EsiSchemaForm
          schema={schema}
          resourceType="secretstore"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formId={formId}
          disabled={isPending}
          hideSubmitButton
          onSuccess={handleSuccess}
          submitButtonText="Update"
          successMessage="Secret Store updated successfully"
        />
      </div>
    </>
  );
}
