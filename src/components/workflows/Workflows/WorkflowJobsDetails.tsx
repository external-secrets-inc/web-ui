import { useState } from "react";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowStep,
} from "./Workflows.interfaces";
import { formatDate } from "@/utils/dateUtils";

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

export function WorkflowJobsDetails({ workflow }: { workflow: WorkflowData }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-card rounded-lg border p-6">
        {Object.entries(workflow.jobs).length > 0 ? (
          <ul className="space-y-4">
            {Object.entries(workflow.jobs).map(([jobName, job]) => (
              <li key={jobName}>
                <JobDetails name={jobName} job={job} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-muted-foreground">No jobs found</p>
        )}
      </section>
    </div>
  );
}
