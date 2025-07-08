import { Loader } from "@/components/ui/Loader";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo, useState } from "react";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowRunData,
} from "./Workflows.interfaces";
import { useParams } from "react-router-dom";
import useGetWorkflowRun from "@/services/workflows/queries/useGetWorkflowRun";
import { WorkflowJobsDetails } from "./WorkflowJobsDetails";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutPortalHeaderActions } from "@/components/layout";
import WorkflowJobsGraph from "./WorkflowJobsGraph";
import useGetWorkflow from "@/services/workflows/queries/useGetWorkflow";
import { formatDate } from "@/utils/dateUtils";

type BadgeVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "success"
  | "warning";

const phaseToColor: Record<string, BadgeVariant> = {
  Succeeded: "success",
  Pending: "warning",
  Failed: "destructive",
  Error: "destructive",
  Unknown: "destructive",
};

export function WorkflowRunDetails() {
  const {
    templateNamespace,
    templateName,
    workflowRunNamespace,
    workflowRunName,
  } = useParams();

  const defaultTab = "details";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const onTabChange = (value: string) => {
    setActiveTab(value);
  };

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
    if (!workflowRunData)
      return {
        name: workflowRunName,
        namespace: workflowRunNamespace,
        templateRef: { namespace: templateNamespace, name: templateName },
        parameters: {},
        variables: {},
        phase: "Pending",
        startTime: "",
        completionTime: "",
      } as WorkflowRunData;

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

  const {
    data: workflowData,
    isLoading: isLoadingWorkflow,
    error: workflowError,
  } = useGetWorkflow(
    { namespace: workflowNamespace, name: workflowName },
    {
      staleTime: 30000,
      enabled: !!workflowNamespace && !!workflowName,
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
      return {
        name: "unknown-workflow",
        namespace: "default",
        manifest: "",
        phase: "Pending",
        startTime: "",
        completionTime: "",
        jobs: {},
      } as WorkflowData;

    return workflowData;
  }, [workflowData]);

  const orderedJobs = useMemo<Record<string, WorkflowJob>>(() => {
    const sortedNames: string[] = [];
    const processed = new Set<string>();
    let remainingJobs = Object.keys(workflow.jobs);

    while (remainingJobs.length > 0) {
      const initialLength = remainingJobs.length;

      remainingJobs = remainingJobs.filter((name) => {
        const deps = workflow.jobs[name].dependsOn;
        if (deps.every((d) => processed.has(d))) {
          sortedNames.push(name);
          processed.add(name);
          return false; // Remove from remaining
        }
        return true; // Keep in remaining
      });

      if (remainingJobs.length === initialLength) {
        throw new Error("cyclic dependency detected");
      }
    }

    return sortedNames.reduce<Record<string, WorkflowJob>>((acc, name) => {
      acc[name] = workflow.jobs[name];
      return acc;
    }, {});
  }, [workflow.jobs]);

  return (
    <>
      {isLoadingRunWorkflow || isLoadingWorkflow ? (
        <div className="flex justify-center items-center flex-1 w-full h-full">
          <Loader />
        </div>
      ) : (
        <div>
          <LayoutPortalHeaderActions>
            <div>
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 text-${
                  phaseToColor[workflowRun.phase] ?? "destructive"
                }`}
              >
                {workflowRun.phase}
              </span>
            </div>
          </LayoutPortalHeaderActions>
          <div className="mb-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Status + Times */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Workflow Status:</h3>
                  <span
                    className={`text-lg text-${
                      phaseToColor[workflow.phase] ?? "destructive"
                    }`}
                  >
                    {workflow.phase}
                  </span>
                </div>
                <div className="pl-4">
                  <span className="font-medium">Start Time:</span>
                  <span className="ml-2 font-medium">
                    {workflow.startTime
                      ? formatDate(workflow.startTime, { format: "full" })
                      : "No data available"}
                  </span>
                </div>
                <div className="pl-4">
                  <span className="font-medium">Completion Time:</span>
                  <span className="ml-2 font-medium">
                    {workflow.completionTime
                      ? formatDate(workflow.completionTime, { format: "full" })
                      : "No data available"}
                  </span>
                </div>
              </div>

              {/* Right Column: Parameters */}
              <div>
                <h3 className="text-lg font-bold">Parameters</h3>
                <div className="pl-4">
                  {Object.entries(workflowRun.parameters).length > 0 ? (
                    Object.entries(workflowRun.parameters).map(
                      ([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2 font-medium">{value}</span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-muted-foreground">No parameters</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Jobs</h3>
              <div className="text-sm">
                {Object.keys(workflow.jobs).length} job(s)
              </div>
            </div>
            <Tabs
              defaultValue={defaultTab}
              onValueChange={onTabChange}
              value={activeTab}
            >
              <TabsList className="mb-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="graph">Graph</TabsTrigger>
              </TabsList>
              <TabsContent
                className="data-[state=active]:grid min-h-0"
                value="details"
              >
                <WorkflowJobsDetails jobs={orderedJobs} />
              </TabsContent>
              <TabsContent
                className="data-[state=active]:grid min-h-0"
                value="graph"
              >
                <div className="bg-card rounded-lg border p-4">
                  <div className="h-[600px] w-full">
                    <WorkflowJobsGraph workflow={workflow} jobs={orderedJobs} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}
