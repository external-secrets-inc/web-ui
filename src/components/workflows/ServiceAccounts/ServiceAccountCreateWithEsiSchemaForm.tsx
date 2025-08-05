import YAML from "yaml";
import { Button } from "@/components/ui/button";
import { EsiSchemaForm, type KubernetesManifest } from "@/components/EsiSchemaForm";
import useCreateServiceAccount from "@/services/workflows/mutations/useCreateServiceAccount";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function ServiceAccountCreateWithEsiSchemaForm() {
  const navigate = useNavigate();

  const { data: schema, isLoading, error } = useGetUISchema("secret");
  const { mutateAsync: createServiceAccount, isPending } = useCreateServiceAccount();

  const formId = "secret-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createServiceAccount({ manifest: yamlContent });
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
              Create ServiceAccount
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <EsiSchemaForm
          schema={schema}
          resourceType="serviceaccount"
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
