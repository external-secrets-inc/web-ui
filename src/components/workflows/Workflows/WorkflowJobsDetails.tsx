import { useState } from "react";
import {
  WorkflowJob,
  WorkflowStep,
} from "./Workflows.interfaces";
import { formatDate, formatDuration } from "@/utils/dateUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
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
    <div className="border-l pl-4 py-2 ml-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{name}</span>
          <StatusBadge status={step.phase} />
          <span className="text-xs">Type: {step.type}</span>
        </div>
        {hasOutputs && (
          <button
            onClick={() => setShowOutputs(!showOutputs)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showOutputs ? "Hide Outputs" : "Show Outputs"}
          </button>
        )}
      </div>

      <div className="text-xs text-muted-foreground mt-1 space-y-1">
        <div>
          Start:{" "}
          {step.startTime
            ? formatDate(step.startTime, { format: "full" })
            : "No data available"}
        </div>
        <div>
          Completion:{" "}
          {step.completionTime
            ? formatDate(step.completionTime, { format: "full" })
            : "No data available"}
        </div>
        <div>
            Execution:{" "}
            {step.executionTimeNanos &&
            step.executionTimeNanos > 0
              ? formatDuration(step.executionTimeNanos)
              : "No data available"}
          </div>
      </div>

      {showOutputs && hasOutputs && (
        <div className="mt-2 p-2 rounded text-xs bg-muted max-w-full overflow-hidden">
          <div className="font-medium mb-1">Outputs:</div>
          <pre className="overflow-auto max-h-40 max-w-full break-words whitespace-pre-wrap bg-muted rounded border p-2">
            {JSON.stringify(step.outputs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const JobAccordionItem: React.FC<{ name: string; job: WorkflowJob }> = ({
  name,
  job,
}) => {
  const stepCount = Object.keys(job.steps).length;

  return (
    <AccordionItem value={name}>
      <AccordionTrigger>
        <div className="flex items-center gap-3">
          <span className="text-base font-medium">{name}</span>
          <StatusBadge status={job.phase} />
          <span className="text-sm">Type: {job.type}</span>
          <span className="text-sm">
            {stepCount} step{stepCount !== 1 ? "s" : ""}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="text-sm mb-3 grid grid-cols-2 gap-2">
          <div>
            Start Time:{" "}
            {job.startTime
              ? formatDate(job.startTime, { format: "full" })
              : "No data available"}
          </div>
          <div>
            Completion Time:{" "}
            {job.completionTime
              ? formatDate(job.completionTime, { format: "full" })
              : "No data available"}
          </div>
          <div>
            Execution:{" "}
            {job.executionTimeNanos &&
            job.executionTimeNanos > 0
              ? formatDuration(job.executionTimeNanos)
              : "No data available"}
          </div>
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
      </AccordionContent>
    </AccordionItem>
  );
};

export function WorkflowJobsDetails({jobs }: { jobs: Record<string, WorkflowJob> }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-card rounded-lg border p-6">
        {Object.entries(jobs).length > 0 ? (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={Object.keys(jobs)}
          >
            {Object.entries(jobs).map(([jobName, job]) => (
              <JobAccordionItem key={jobName} name={jobName} job={job} />
            ))}
          </Accordion>
        ) : (
          <p className="italic text-muted-foreground">No jobs found</p>
        )}
      </section>
    </div>
  );
}
