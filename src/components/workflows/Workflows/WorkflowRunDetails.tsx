import { DetailsCard } from "@/components/ui/DetailsCard";
import { Loader } from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useGetWorkflow from "@/services/workflows/queries/useGetWorkflow";
import useGetWorkflowRun from "@/services/workflows/queries/useGetWorkflowRun";
import { formatDate, formatDuration } from "@/utils/dateUtils";
import { LucideClock, LucideInfo, LucideSettings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkflowJobsDetails } from "./WorkflowJobsDetails";
import WorkflowJobsGraph from "./WorkflowJobsGraph";
import {
  WorkflowData,
  WorkflowJob,
  WorkflowRunData,
} from "./Workflows.interfaces";

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

function isSimpleValue(value: unknown): boolean {
  return (
    value === null ||
    ["string", "number", "boolean"].includes(typeof value) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
}

function renderValue(value: unknown, renderInline = false): React.ReactNode {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">Empty array</span>;
    }

    return (
      <div>
        {value.map((item, idx) => (
          <div key={idx} className="flex">
            <div className="mr-2">-</div>
            <div>{renderValue(item, false)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    if (Object.keys(value).length === 0) {
      return <span className="text-muted-foreground">Empty object</span>;
    }

    return (
      <div>
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className={isSimpleValue(v) ? "flex" : ""}>
            <div className="font-medium">{k}:</div>
            <div className="ml-2">{renderValue(v, true)}</div>
          </div>
        ))}
      </div>
    );
  }

  return renderInline ? (
    <span>{String(value)}</span>
  ) : (
    <div className="ml-2">{String(value)}</div>
  );
}

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
          <div>
            <div className="space-y-8">
              <DetailsCard
                icon={LucideInfo}
                title="Workflow Run Details"
                fields={[
                  {
                    label: "Workflow Run Status",
                    value: (
                      <span
                        className={`text-${
                          phaseToColor[workflow.phase] ?? "destructive"
                        }`}
                      >
                        {workflow.phase}
                      </span>
                    ),
                  },
                  {
                    label: "Workflow Status",
                    value: (
                      <span
                        className={`text-${
                          phaseToColor[workflow.phase] ?? "destructive"
                        }`}
                      >
                        {workflow.phase}
                      </span>
                    ),
                  },
                ]}
                sections={[
                  {
                    title: "Chronology",
                    icon: LucideClock,
                    fields: [
                      {
                        label: "Started at",
                        value: workflow.startTime
                          ? formatDate(workflow.startTime, { format: "full" })
                          : "No data available",
                      },
                      {
                        label: "Completed at",
                        value: workflow.completionTime
                          ? formatDate(workflow.completionTime, {
                              format: "full",
                            })
                          : "No data available",
                      },
                      {
                        label: "Executed in",
                        value:
                          workflow.executionTimeNanos &&
                          workflow.executionTimeNanos > 0
                            ? formatDuration(workflow.executionTimeNanos)
                            : "No data available",
                      },
                    ],
                  },
                  {
                    title: "Parameters",
                    icon: LucideSettings2,
                    fields: [
                      ...(Object.entries(workflowRun.parameters).length > 0
                        ? Object.entries(workflowRun.parameters).map(
                            ([key, value]) => {
                              const primitive = isSimpleValue(value);
                              return primitive
                                ? {
                                    label: key,
                                    value: renderValue(value, true),
                                  }
                                : {
                                    label: key,
                                    value: renderValue(value),
                                  };
                            }
                          )
                        : [
                            {
                              label: "No parameters",
                              value: "",
                            },
                          ]),
                    ],
                  },
                ]}
              />
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
                          <WorkflowJobsGraph
                            workflow={workflow}
                            jobs={orderedJobs}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
