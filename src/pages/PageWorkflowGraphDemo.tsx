import { WorkflowGraph } from "@/components/workflows/Workflows";
import { LayoutPage } from "@/components/layout";
import { WorkflowData } from "@/components/workflows/Workflows/Workflows.interfaces";

// Sample workflow data similar to what you'd see from eso-server
const sampleWorkflowData: WorkflowData = {
  name: "standard-job-template-run-6760",
  namespace: "default",
  status: { status: "Succeeded", reason: "Workflow completed successfully" },
  manifest: "",
  phase: "Succeeded",
  startTime: "2024-01-15T10:30:00Z",
  completionTime: "2024-01-15T10:35:00Z",
  jobs: {
    "fetch-secrets": {
      phase: "Succeeded",
      type: "standard",
      startTime: new Date("2024-01-15T10:30:00Z"),
      completionTime: new Date("2024-01-15T10:32:00Z"),
      steps: {
        "validate-input": {
          type: "debug",
          phase: "Succeeded",
          startTime: new Date("2024-01-15T10:30:00Z"),
          completionTime: new Date("2024-01-15T10:30:30Z"),
          outputs: {}
        },
        "fetch-from-vault": {
          type: "generator",
          phase: "Succeeded",
          startTime: new Date("2024-01-15T10:30:30Z"),
          completionTime: new Date("2024-01-15T10:32:00Z"),
          outputs: {}
        }
      }
    },
    "transform-data": {
      phase: "Succeeded",
      type: "standard",
      startTime: new Date("2024-01-15T10:32:00Z"),
      completionTime: new Date("2024-01-15T10:34:00Z"),
      steps: {
        "parse-json": {
          type: "transform",
          phase: "Succeeded",
          startTime: new Date("2024-01-15T10:32:00Z"),
          completionTime: new Date("2024-01-15T10:33:00Z"),
          outputs: {}
        },
        "validate-schema": {
          type: "javascript",
          phase: "Succeeded",
          startTime: new Date("2024-01-15T10:33:00Z"),
          completionTime: new Date("2024-01-15T10:34:00Z"),
          outputs: {}
        }
      }
    },
    "push-to-k8s": {
      phase: "Succeeded",
      type: "standard",
      startTime: new Date("2024-01-15T10:34:00Z"),
      completionTime: new Date("2024-01-15T10:35:00Z"),
      steps: {
        "create-secret": {
          type: "push",
          phase: "Succeeded",
          startTime: new Date("2024-01-15T10:34:00Z"),
          completionTime: new Date("2024-01-15T10:35:00Z"),
          outputs: {}
        }
      }
    }
  },
  createdFromTemplate: true,
  templateRef: {
    name: "standard-job-template",
    namespace: "default"
  },
  variables: {
    "vault_path": "/secret/myapp",
    "k8s_namespace": "production"
  }
};

export function PageWorkflowGraphDemo() {
  return (
    <LayoutPage
      title="Workflow Graph Demo"
      description="WorkflowGraph component with sample data"
    >
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Sample Workflow: {sampleWorkflowData.name}</h3>
          <p className="text-muted-foreground mb-4">
            Workflow Graph Page
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 text-green-600">{sampleWorkflowData.phase}</span>
            </div>
            <div>
              <span className="font-medium">Jobs:</span>
              <span className="ml-2">{Object.keys(sampleWorkflowData.jobs).length}</span>
            </div>
            <div>
              <span className="font-medium">Total Steps:</span>
              <span className="ml-2">
                {Object.values(sampleWorkflowData.jobs).reduce((total, job) => 
                  total + Object.keys(job.steps).length, 0
                )}
              </span>
            </div>
            <div>
              <span className="font-medium">Template:</span>
              <span className="ml-2">{sampleWorkflowData.templateRef?.name}</span>
            </div>
          </div>
        </div>

        {/* Workflow Graph Container */}
        <div className="bg-card rounded-lg border p-4">
          <div className="h-[600px] w-full">
            <WorkflowGraph workflow={sampleWorkflowData} />
          </div>
        </div>
      </div>
    </LayoutPage>
  );
}