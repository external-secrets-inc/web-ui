import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import YAML from "yaml";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import useCreateWorkflowTemplate from "@/services/workflows/mutations/useCreateWorkflowTemplate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

/**
 * Validates that the YAML content is a valid WorkflowTemplate manifest.
 * @param yamlContent - The YAML string to validate.
 * @param ctx - The Zod refinement context.
 */
const validateWorkflowTemplateYaml = (
  yamlContent: string,
  ctx: z.RefinementCtx
) => {
  if (!yamlContent) {
    // Let the min(1) check handle the empty case.
    return;
  }

  try {
    const doc = YAML.parseDocument(yamlContent, {
      strict: true,
      logLevel: "silent",
    });

    if (doc.errors.length > 0) {
      // Show only the first parse error for simplicity.
      const firstError = doc.errors[0];
      const line = firstError.linePos?.[0]?.line ?? "YAML";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Parse error near line ${line}: ${firstError.message}`,
      });
      return;
    }

    if (!doc.contents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "YAML content is empty or invalid.",
      });
      return;
    }

    const manifest = doc.toJS();
    if (manifest.kind !== "WorkflowTemplate") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid resource kind: Expected "WorkflowTemplate", got "${
          manifest.kind || "unknown"
        }".`,
      });
    }
    if (!manifest.metadata?.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Manifest is missing required field: metadata.name",
      });
    }
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        e instanceof Error
          ? e.message
          : "An unknown error occurred during YAML parsing.",
    });
  }
};

const workflowTemplateFormSchema = z.object({
  yamlContent: z
    .string()
    .min(1, { message: "Manifest cannot be empty." })
    .superRefine(validateWorkflowTemplateYaml),
});

type WorkflowTemplateFormData = z.infer<typeof workflowTemplateFormSchema>;

/**
 * Generates a default YAML template for a WorkflowTemplate.
 * @returns A string containing the YAML template.
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "workflows.external-secrets.io/v1alpha1",
    kind: "WorkflowTemplate",
    metadata: {
      name: "my-template",
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

export function WorkflowTemplateCreateForm() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

  const form = useForm<WorkflowTemplateFormData>({
    resolver: zodResolver(workflowTemplateFormSchema),
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  const { mutate: createWorkflowTemplate, isPending } =
    useCreateWorkflowTemplate();

  useEffect(() => {
    // Only set the default value once on initial mount.
    if (!form.getValues("yamlContent")) {
      const initialTemplate = createDefaultYamlTemplate();
      form.setValue("yamlContent", initialTemplate);
    }
  }, [form]);

  const handleCancel = () => {
    navigate(getOrgLink("/workflows/templates"));
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
          // Keep error handling simple and self-contained.
          let message =
            "An unknown error occurred while creating the workflow template.";
          if (
            typeof error === "object" &&
            error !== null &&
            "response" in error
          ) {
            const response = (
              error as { response?: { data?: Record<string, unknown> } }
            ).response;
            const errorData = response?.data;
            if (errorData) {
              const errorsArray = errorData.errors as [{ message: string }?];
              message =
                (errorData.error as string) ||
                (errorData.message as string) ||
                (errorsArray && errorsArray[0]?.message) ||
                message;
            }
          } else if (error instanceof Error) {
            message = error.message;
          }

          form.setError("yamlContent", {
            type: "server",
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
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="yamlContent"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Workflow Template Manifest (YAML)</FormLabel>
                <FormControl>
                  <CodeTextarea
                    {...field}
                    language="yaml"
                    placeholder="Enter YAML manifest"
                    className="min-h-[400px]"
                  />
                </FormControl>
                {error?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {error.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
