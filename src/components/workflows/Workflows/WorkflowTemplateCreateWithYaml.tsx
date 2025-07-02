import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateWorkflowTemplate from "@/services/workflows/mutations/useCreateWorkflowTemplate";
import { useState } from "react";
import { toast } from "sonner";
import YAML, { parse } from "yaml";
import WorkflowJobsGraph from "./WorkflowJobsGraph";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowStep,
} from "./Workflows.interfaces";

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
 * Generates a default YAML template for a WorkflowTemplate
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
  const [workflowTemplate, setWorkflowTemplate] = useState<WorkflowData | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mutation = useCreateWorkflowTemplate();

  const handleRenderGraph = (yamlContent: string) => {
    const workflow = convertYamlToWorkflowData(yamlContent);
    if (workflow && workflow.jobs && Object.keys(workflow.jobs).length > 0) {
      setWorkflowTemplate(workflow);
    } else {
      setWorkflowTemplate(null);
      toast.error("No valid workflow template to render.");
      return;
    }
    setIsDialogOpen(true);
  };

  const renderGraphButton = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => {
        // We need to access the form data from the wrapper
        // For now, we'll pass the current yamlContent from the form
        const form = document.getElementById(
          "workflow-template-form"
        ) as HTMLFormElement;
        const textarea = form?.querySelector(
          'textarea[name="yamlContent"]'
        ) as HTMLTextAreaElement;
        if (textarea) {
          handleRenderGraph(textarea.value);
        }
      }}
    >
      Render Graph
    </Button>
  );

  return (
    <>
      <YamlFormWrapper
        resourceType="workflowtemplate"
        createDefaultTemplate={createDefaultYamlTemplate}
        mutation={mutation}
        formLabel="Workflow Template Manifest (YAML)"
        formDescription="Write your Workflow Template configuration directly in YAML format. Perfect for power users who want full control, or when importing existing templates. Alternatively, you may use the Form Builder for a guided experience."
        submitButtonText="Create Workflow Template"
        formId="workflow-template-form"
        additionalActions={renderGraphButton}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]">
          <DialogHeader>
            <DialogTitle>Workflow Graph</DialogTitle>
            <DialogDescription>
              This graph visualizes the jobs and steps defined in your Workflow
              Template.
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
