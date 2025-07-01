import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import YAML from "yaml";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldYaml } from "@/components/ui/fields/FieldYaml";
import useCreateWorkflowTemplate from "@/services/workflows/mutations/useCreateWorkflowTemplate";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { parse } from "yaml";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowStep,
} from "./Workflows.interfaces";
import WorkflowJobsGraph from "./WorkflowJobsGraph";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Adjust if your path differs

// Defaults to simplify mock status
const DEFAULT_PHASE = "Succeeded";

export function convertYamlToWorkflowData(yamlString: string): WorkflowData {
  const parsed = parse(yamlString);

  if (!parsed || typeof parsed !== "object") {
    return {} as WorkflowData;
  }

  const name = parsed?.spec?.name || parsed?.metadata?.name || "workflow";
  const namespace = parsed?.metadata?.namespace || "default";

  const jobs: Record<string, WorkflowJob> = {};

  for (const [jobName, jobDef] of Object.entries(parsed.spec?.jobs || {})) {
    // Each job has a type like: job1: { standard: { steps: [...] } }
    if (typeof jobDef !== "object" || jobDef === null) continue;

    const jobEntries = Object.entries(
      jobDef as {
        [jobType: string]: {
          steps: Array<{
            name: string;
            [stepType: string]: unknown;
          }>;
        };
      }
    );
    if (jobEntries.length === 0) continue;

    const [type, jobContent] = jobEntries[0];
    const steps = jobContent?.steps || [];

    const stepsRecord: Record<string, WorkflowStep> = {};
    for (const step of steps) {
      const stepName = step.name;
      const [stepType] = Object.entries(step).find(([k]) => k !== "name") ?? [];

      stepsRecord[stepName] = {
        type: stepType ?? "unknown",
        phase: DEFAULT_PHASE,
        outputs: {}, // You can enhance this if outputs are needed
      };
    }

    jobs[jobName] = {
      phase: DEFAULT_PHASE,
      type,
      steps: stepsRecord,
      dependsOn: [], // Optional, depends on your YAML schema
    };
  }

  const workflowData: WorkflowData = {
    name,
    namespace,
    status: { status: DEFAULT_PHASE, reason: "" },
    manifest: yamlString,
    phase: DEFAULT_PHASE,
    jobs,
  };

  return workflowData;
}

/**
 * Validates WorkflowTemplate-specific business logic.
 * @param yamlContent - The YAML string to validate.
 * @param parsedYaml - The parsed YAML object.
 * @returns Error message or null if valid.
 */
const validateWorkflowTemplateManifest = (
  yamlContent: string,
  parsedYaml?: unknown
): string | null => {
  if (!yamlContent || !parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  if (manifest.kind !== "WorkflowTemplate") {
    return `Invalid resource kind: Expected "WorkflowTemplate", got "${
      manifest.kind || "unknown"
    }".`;
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
return { message: "Template processed successfully" };`,
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

export function WorkflowTemplateCreateWithYaml() {
  const navigate = useNavigate();
  const [workflowTemplate, setWorkflowTemplate] = useState<WorkflowData | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<WorkflowTemplateFormData>({
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  const { mutate: createWorkflowTemplate, isPending } =
    useCreateWorkflowTemplate();

  useEffect(() => {
    if (!form.getValues("yamlContent")) {
      const initialTemplate = createDefaultYamlTemplate();
      form.setValue("yamlContent", initialTemplate);
    }
  }, [form]);

  const onSubmit = (data: WorkflowTemplateFormData) => {
    createWorkflowTemplate(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          toast.success("Workflow Template created successfully");
          navigate("..");
        },
        onError: (error: unknown) => {
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
              // Use the normalized error structure from AxiosInterceptor
              const errorsObject = errorData.errors as { body?: string };
              message =
                errorsObject?.body || // Consistent normalized format across all backends
                (errorData.error as string) ||
                (errorData.message as string) ||
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

  const handleRenderGraph = () => {
    const workflow = convertYamlToWorkflowData(form.getValues("yamlContent"));
    if (workflow && workflow.jobs && Object.keys(workflow.jobs).length > 0) {
      setWorkflowTemplate(workflow);
    } else {
      setWorkflowTemplate(null);
      toast.error("No valid workflow template to render.");
      return;
    }
    setIsDialogOpen(true);
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
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleRenderGraph()}
          >
            Render Graph
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
                  return validateWorkflowTemplateManifest(value, parsedYaml);
                } catch {
                  // YAML parsing errors are handled by FieldYaml itself
                  return true;
                }
              },
            }}
          />
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]">
          <DialogHeader>
            <DialogTitle>Workflow Graph</DialogTitle>
            <DialogDescription>
              This graph visualizes the jobs and steps defined in your Workflow Template.
            </DialogDescription>
          </DialogHeader>
          {workflowTemplate && (
            <div className="h-[600px] w-full">
              <WorkflowJobsGraph
                workflow={workflowTemplate}
                jobs={workflowTemplate.jobs}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
