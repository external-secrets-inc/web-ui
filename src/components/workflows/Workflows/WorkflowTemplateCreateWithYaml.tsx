import { useEffect } from "react";
import { useForm } from "react-hook-form";
import YAML from "yaml";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldYaml } from "@/components/ui/fields/FieldYaml";
import useCreateWorkflowTemplate from "@/services/workflows/mutations/useCreateWorkflowTemplate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

interface WorkflowTemplateCreateWithYamlProps {
  onCancel?: () => void;
}

/**
 * Validates WorkflowTemplate-specific business logic.
 * @param yamlContent - The YAML string to validate.
 * @param parsedYaml - The parsed YAML object.
 * @returns Error message or null if valid.
 */
const validateWorkflowTemplateManifest = (yamlContent: string, parsedYaml?: unknown): string | null => {
  if (!yamlContent || !parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  if (manifest.kind !== "WorkflowTemplate") {
    return `Invalid resource kind: Expected "WorkflowTemplate", got "${manifest.kind || "unknown"}".`;
  }

  const metadata = manifest.metadata as Record<string, unknown> | undefined;
  if (!metadata?.name) {
    return "Manifest is missing required field: metadata.name";
  }

  return null;
};

interface WorkflowTemplateFormData {
  yamlContent: string;
}

/**
 * Generates a default YAML template for a WorkflowTemplate.
 * @returns A string containing the YAML template.
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "workflows.external-secrets.io/v1alpha1",
    kind: "WorkflowTemplate",
    metadata: {
      name: "",
      namespace: "default",
    },
    spec: {
      name: "job-1",
      version: "v1",
      parameters: [
        {
          name: "image",
          description: "The container image to use",
          required: true,
          default: "nginx:latest",
        },
        {
          name: "replicas",
          description: "Number of replicas",
          required: false,
          default: "1",
        },
      ],
      jobs: {
        job1: {
          standard: {
            steps: [
              {
                name: "step1",
                javascript: {
                  script: `console.log("Using image: " + params.image);
console.log("Replicas: " + params.replicas);
return { message: "Template processed successfully" };`
                },
              },
            ],
          },
        },
      },
    },
  };
  return YAML.stringify(sampleManifest);
}

export function WorkflowTemplateCreateWithYaml({ onCancel }: WorkflowTemplateCreateWithYamlProps) {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

  const form = useForm<WorkflowTemplateFormData>({
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  const { mutate: createWorkflowTemplate, isPending } =
    useCreateWorkflowTemplate();

  useEffect(() => {
    if (!form.getValues('yamlContent')) {
      const initialTemplate = createDefaultYamlTemplate();
      form.setValue('yamlContent', initialTemplate);
    }
  }, [form]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(getOrgLink("/workflows/templates"));
    }
  };

  const onSubmit = (data: WorkflowTemplateFormData) => {
    createWorkflowTemplate(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          toast.success("Workflow Template created successfully");
          navigate(getOrgLink("/workflows/templates"));
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
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
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
              Create Workflow Template
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldYaml
            name="yamlContent"
            label="Workflow Template Manifest (YAML)"
            placeholder="Enter YAML manifest"
            className="min-h-[400px]"
            required
            rules={{
              validate: (value: string) => {
                if (!value) return true;

                try {
                  const parsedYaml = YAML.parse(value);
                  return validateWorkflowTemplateManifest(value, parsedYaml);
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