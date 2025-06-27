import { Loader } from "@/components/ui/Loader";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo } from "react";
import { WorkflowRunData } from "./Workflows.interfaces";
import { useParams } from "react-router-dom";
import useGetWorkflowRun from "@/services/workflows/queries/useGetWorkflowRun";
import { WorkflowDetails } from "./WorkflowDetails";

const sampleWorkflowRun: WorkflowRunData = {
  name: "run-success-2",
  namespace: "default",
  templateRef: { name: "template-a", namespace: "default" },
  parameters: {
    image: "nginx:1.25",
    replicas: "3",
  },
  variables: {
    env: "production",
    retryCount: "2",
  },
  phase: "Succeeded",
  startTime: "2025-06-21T14:00:00Z",
  completionTime: "2025-06-21T14:07:00Z",
};

export function WorkflowRunDetails() {
  const {
    templateNamespace,
    templateName,
    workflowRunNamespace,
    workflowRunName,
  } = useParams();

  const {
    data: workflowRunData,
    isLoading: isLoadingRunWorkflow,
    error: workflowRunError,
  } = useGetWorkflowRun(
    { namespace: workflowRunNamespace ?? "", name: workflowRunName ?? "" },
    {
      staleTime: 30000,
      enabled: !!workflowRunNamespace && !!workflowRunName,
    }
  );

  useEffect(() => {
    if (workflowRunError) {
      handleDefaultApiHttpError(
        workflowRunError,
        `Error while fetching workflow run data`
      );
    }
  }, [workflowRunError]);

  const workflowRun = useMemo(() => {
    if (!workflowRunData) return sampleWorkflowRun;
    // return {
    //   name: workflowRunName,
    //   namespace: workflowRunNamespace,
    //   templateRef: { namespace: templateNamespace, name: templateName },
    //   parameters: {},
    //   variables: {},
    //   phase: "Pending",
    //   startTime: "",
    //   completionTime: "",
    // } as WorkflowRunData;

    return workflowRunData;
  }, [
    workflowRunData,
    workflowRunName,
    workflowRunNamespace,
    templateNamespace,
    templateName,
  ]);

  const workflowName = workflowRun.workflowRef?.name ?? "";
  const workflowNamespace = workflowRun.workflowRef?.namespace ?? "";
  const statusColor =
    workflowRun.phase == "Succeeded"
      ? "success"
      : workflowRun.phase == "Pending"
      ? "warning"
      : "destructive";

  if (!workflowRunNamespace || !workflowRunName) return null;

  return (
    <>
      {isLoadingRunWorkflow ? (
        <div className="flex justify-center items-center flex-1 w-full h-full">
          <Loader />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 text-${statusColor}`}>
                {workflowRun.phase}
              </span>
            </div>
            <div>
              <span className="font-medium">Template:</span>
              <span className="ml-2">{workflowRun.templateRef?.name}</span>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2">Parameters</h3>
            <div className="p-4 rounded-md">
              {Object.entries(workflowRun.parameters).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(workflowRun.parameters).map(
                    ([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span>{value}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>No parameters</p>
              )}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="h-full w-full">
              <WorkflowDetails
                namespace={workflowNamespace}
                name={workflowName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
