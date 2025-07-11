import YAML from "yaml";
import { Button } from "@/components/ui/button";
import { EsiSchemaForm, type KubernetesManifest } from "@/components/EsiSchemaForm";
import useCreateWorkflowRunTemplate from "@/services/workflows/mutations/useCreateWorkflowRunTemplate";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function WorkflowRunTemplateCreateWithEsiSchemaForm() {
  const navigate = useNavigate();
  const { templateNamespace, templateName } = useParams<{
    templateNamespace: string;
    templateName: string;
  }>();

  const [searchParams] = useSearchParams();
  const finding = searchParams.get("finding")

  let resourcePath = `workflowruntemplates/${templateNamespace}/${templateName}`;
  if(finding) {
    resourcePath += `?finding=${finding}`
  }

  const { data: schema, isLoading, error } = useGetUISchema(resourcePath);
  const { mutateAsync: createWorkflowRunTemplate, isPending } = useCreateWorkflowRunTemplate();

  const formId = "workflow-run-template-form";

  const handleSubmit = async (manifest: KubernetesManifest) => {
    const yamlContent = YAML.stringify(manifest);
    await createWorkflowRunTemplate({ manifest: yamlContent });
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
              Create Run Template
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        <EsiSchemaForm
          schema={schema}
          resourceType="workflowruntemplate"
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
