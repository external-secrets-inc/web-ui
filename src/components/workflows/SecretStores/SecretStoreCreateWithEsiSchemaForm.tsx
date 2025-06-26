import YAML from "yaml";
import { Button } from "@/components/ui/button";
import { EsiSchemaForm, type KubernetesManifest } from "@/components/EsiSchemaForm";
import useCreateSecretStore from "@/services/workflows/mutations/useCreateSecretStore";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SecretStoreCreateWithEsiSchemaFormProps {
  onCancel?: () => void;
}

export function SecretStoreCreateWithEsiSchemaForm({ onCancel }: SecretStoreCreateWithEsiSchemaFormProps) {
  const navigate = useNavigate();

  const { data: schema, isLoading, error } = useGetUISchema("secretstore");
  const { mutateAsync: createSecretStore, isPending } = useCreateSecretStore();

  const formId = "secret-store-form";

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("..");
    }
  };

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createSecretStore({ manifest: yamlContent });
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

  return (
    <>
      <LayoutPortalTopbarActions>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
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
              Create Secret Store
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <EsiSchemaForm
          schema={schema}
          resourceType="secretstore"
          onSubmit={handleSubmit}
          formId={formId}
          disabled={isPending}
          hideSubmitButton
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}