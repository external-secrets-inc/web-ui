import { useEffect } from "react";
import { useForm } from "react-hook-form";
import YAML from "yaml";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldYaml } from "@/components/ui/fields/FieldYaml";
import useCreateWorkflowRunTemplate from "@/services/workflows/mutations/useCreateWorkflowRunTemplate";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

/**
 * Validates WorkflowRunTemplate-specific business logic.
 * @param yamlContent - The YAML string to validate.
 * @param parsedYaml - The parsed YAML object.
 * @returns Error message or null if valid.
 */
const validateWorkflowRunTemplateManifest = (yamlContent: string, parsedYaml?: unknown): string | null => {
  if (!yamlContent || !parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  if (manifest.kind !== "WorkflowRunTemplate") {
    return `Invalid resource kind: Expected "WorkflowRunTemplate", got "${manifest.kind || "unknown"}".`;
  }

  const metadata = manifest.metadata as Record<string, unknown> | undefined;
  if (!metadata?.name) {
    return "Manifest is missing required field: metadata.name";
  }

  return null;
};

interface WorkflowRunTemplateFormData {
  yamlContent: string;
}

/**
 * Generates a default YAML template for a WorkflowRunTemplate.
 * @returns A string containing the YAML template.
 */
function createDefaultYamlTemplate(templateNamespace: string, templateName: string): string {
  const sampleManifest = {
    apiVersion: "workflows.external-secrets.io/v1alpha1",
    kind: "WorkflowRunTemplate",
    metadata: {
      name: templateName + "-run-template",
      namespace: templateNamespace,
    },
    spec: {
      runSpec: {
        templateRef: {
          name: templateName,
        },
        arguments: {
          storeName: "vault-backend",
          storesToDistribute: "k8s-store-market,k8s-store-shopping,k8s-store-shoeshop",
          keyToDistribute: "my-secret",
        },
      },
      revisionHistoryLimit: 1,
      runPolicy: {
        once: {},
      },
    },
  };

  return YAML.stringify(sampleManifest);
}

export function WorkflowRunTemplateCreateWithYaml() {
  const navigate = useNavigate();
  const { templateNamespace, templateName } = useParams();

  const form = useForm<WorkflowRunTemplateFormData>({
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  const { mutate: createWorkflowRunTemplate, isPending } =
    useCreateWorkflowRunTemplate();

  useEffect(() => {
    if (!form.getValues('yamlContent')) {
      const initialTemplate = createDefaultYamlTemplate(templateNamespace?? "", templateName?? "");
      form.setValue('yamlContent', initialTemplate);
    }
  }, [form, templateNamespace, templateName]);

  const onSubmit = (data: WorkflowRunTemplateFormData) => {
    createWorkflowRunTemplate(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          toast.success("Workflow Run Template created successfully");
          navigate("..");
        },
        onError: (error: unknown) => {
          let message = 'An unknown error occurred while creating the workflow template.';

          if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response?: { data?: Record<string, unknown> } }).response;
            const errorData = response?.data;
            if (errorData) {
              // Use the normalized error structure from AxiosInterceptor
              const errorsObject = errorData.errors as { body?: string };
              message =
                errorsObject?.body ||     // Consistent normalized format across all backends
                (errorData.error as string) ||
                (errorData.message as string) ||
                message;
            }
          } else if (error instanceof Error) {
            message = error.message;
          }

          form.setError('yamlContent', {
            type: 'server',
            message,
          });
        },
      }
    );
  };

  return (
    <>
      <LayoutPortalTopbarActions>
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
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Workflow Run Template
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldYaml
            name="yamlContent"
            label="Workflow Template Manifest (YAML)"
            description="Write your Workflow Template configuration directly in YAML format. Perfect for power users who want full control, or when importing existing templates. Alternatively, you may use the Form Builder for a guided experience."
            placeholder="Enter YAML manifest"
            className="min-h-[400px]"
            descriptionInline
            required
            rules={{
              validate: (value: string) => {
                if (!value) return true;

                try {
                  const parsedYaml = YAML.parse(value);
                  return validateWorkflowRunTemplateManifest(value, parsedYaml);
                } catch {
                  // YAML parsing errors are handled by FieldYaml itself
                  return true;
                }
              }
            }}
          />
        </form>
      </Form>
    </>
  );
}
