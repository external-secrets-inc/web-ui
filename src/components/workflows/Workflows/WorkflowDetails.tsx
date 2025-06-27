import { Loader } from "@/components/ui/Loader";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo, useState } from "react";
import { WorkflowGraph } from "./WorkflowGraph";
import useGetWorkflow from "@/services/workflows/queries/useGetWorkflow";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowStep,
} from "./Workflows.interfaces";
import { formatDate } from "@/utils/dateUtils";

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

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "succeeded":
    case "completed":
      return "bg-green-100 text-green-800";
    case "running":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
      status
    )}`}
  >
    {status}
  </span>
);

const StepDetails: React.FC<{ name: string; step: WorkflowStep }> = ({
  name,
  step,
}) => {
  const [showOutputs, setShowOutputs] = useState(false);
  const hasOutputs = step.outputs && Object.keys(step.outputs).length > 0;

  return (
    <div className="border-l-2 pl-4 py-2 ml-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{name}</span>
          <StatusBadge status={step.phase} />
          <span className="text-xs">Type: {step.type}</span>
        </div>
        {hasOutputs && (
          <button
            onClick={() => setShowOutputs(!showOutputs)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showOutputs ? "Hide Outputs" : "Show Outputs"}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-600 mt-1 space-y-1">
        <div>Start: {formatDate(step.startTime)}</div>
        <div>Completion: {formatDate(step.completionTime)}</div>
      </div>

      {showOutputs && hasOutputs && (
        <div className="mt-2 p-2 rounded text-xs">
          <div className="font-medium mb-1">Outputs:</div>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(step.outputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const JobDetails: React.FC<{ name: string; job: WorkflowJob }> = ({
  name,
  job,
}) => {
  const [expanded, setExpanded] = useState(true);
  const stepCount = Object.keys(job.steps).length;

  return (
    <div className="border rounded-md mb-4">
      <div
        className="flex justify-between items-center p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="font-medium">{name}</span>
          <StatusBadge status={job.phase} />
          <span className="text-sm">Type: {job.type}</span>
          <span className="text-sm">
            {stepCount} step{stepCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">{expanded ? "▼" : "►"}</div>
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t">
          <div className="text-sm mb-3 grid grid-cols-2 gap-2">
            <div>Start Time: {formatDate(job.startTime)}</div>
            <div>Completion Time: {formatDate(job.completionTime)}</div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Steps:</div>
            {Object.entries(job.steps).length > 0 ? (
              Object.entries(job.steps).map(([stepName, step]) => (
                <StepDetails key={stepName} name={stepName} step={step} />
              ))
            ) : (
              <div className="text-sm italic">No steps found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function WorkflowDetails({
  namespace,
  name,
}: {
  namespace: string;
  name: string;
}) {
  const {
    data: workflowData,
    isLoading: isLoadingWorkflow,
    error: workflowError,
  } = useGetWorkflow(
    { namespace: namespace, name: name },
    {
      staleTime: 30000,
      enabled: !!namespace && !!name,
    }
  );

  useEffect(() => {
    if (workflowError) {
      handleDefaultApiHttpError(
        workflowError,
        `Error while fetching workflow data`
      );
    }
  }, [workflowError]);

  const workflow = useMemo(() => {
    if (!workflowData)
      return sampleWorkflowData
      // return {
      //   name: "unknown-workflow",
      //   namespace: "default",
      //   status: { status: "Unkown", reason: "Workflow not found" },
      //   manifest: "",
      //   phase: "Pending",
      //   startTime: "",
      //   completionTime: "",
      //   jobs: {},
      // } as WorkflowData;

    return workflowData;
  }, [workflowData]);

  const statusColor =
    workflow.phase == "Succeeded"
      ? "success"
      : workflow.phase == "Pending"
      ? "warning"
      : "destructive";

  return (
    <>
      {isLoadingWorkflow ? (
        <div className="flex justify-center items-center flex-1 w-full h-full">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-semibold mb-2">
              Workflow: {workflow.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Namespace: {workflow.namespace}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6 text-sm">
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 text-${statusColor}`}>
                  {workflow.phase}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Start Time:</span>
                <span className="ml-2">
                  {workflow.startTime
                    ? formatDate(workflow.startTime)
                    : "No data available"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">Completion Time:</span>
                <span className="ml-2">
                  {workflow.completionTime
                    ? formatDate(workflow.completionTime)
                    : "No data available"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Jobs</h3>
                <div className="text-sm">
                  {Object.keys(workflow.jobs).length} job(s)
                </div>
              </div>

              {Object.entries(workflow.jobs).length > 0 ? (
                Object.entries(workflow.jobs).map(([jobName, job]) => (
                  <JobDetails key={jobName} name={jobName} job={job} />
                ))
              ) : (
                <div className="italic">No jobs found</div>
              )}
            </div>
          </div>
          {/* {!workflowError && !!name && ( */}
            <div className="bg-card rounded-lg border p-4">
              <div className="h-[600px] w-full">
                <WorkflowGraph workflow={workflow} />
              </div>
            </div>
          {/* )} */}
        </div>
      )}
    </>
  );
}
