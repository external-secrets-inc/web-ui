import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import {
  DataProvider,
  DataSearch,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useOrgLink from "@/hooks/useOrgLink";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useCreateWorkflowRunFromRunTemplate from "@/services/workflows/mutations/useCreateWorkflowRunFromRunTemplate";
import useDeleteWorkflowRunTemplate from "@/services/workflows/mutations/useDeleteWorkflowRunTemplate";
import useGetWorkflowRunTemplatesByTemplate from "@/services/workflows/queries/useGetWorkflowRunTemplatesByTemplate";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import {
  LucideMoreVertical,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { WorkflowRunStatusBadge } from "./WorkflowRunStatusBadge";
import type {
  WorkflowRunData,
  WorkflowRunTemplateTableData,
} from "./Workflows.interfaces";

interface WorkflowRunTemplateTableMeta {
  renderRowActions?: (row: WorkflowRunTemplateTableData) => React.ReactNode;
}

const FAST_POLLING_INTERVAL_MS = 100;
const SLOW_POLLING_INTERVAL_MS = 2000;
const FAST_POLLING_TIME_WINDOW_MS = 5000;
const VISIBLE_RUNS_COUNT = 5;

const FINAL_WORKFLOW_STATUSES = ["Succeeded", "Failed"] as const;
type FinalWorkflowStatus = (typeof FINAL_WORKFLOW_STATUSES)[number];

function isWorkflowRunActive(run: WorkflowRunData): boolean {
  return !FINAL_WORKFLOW_STATUSES.includes(run.phase as FinalWorkflowStatus);
}

function getRecentWorkflowRuns(runs: WorkflowRunData[]): WorkflowRunData[] {
  return runs.slice(-VISIBLE_RUNS_COUNT);
}

function hasActiveWorkflowRuns(templates: WorkflowRunTemplateTableData[]) {
  return templates.some((template) =>
    getRecentWorkflowRuns(template.lastRuns).some(isWorkflowRunActive)
  );
}

function shouldStartPolling(
  templates: WorkflowRunTemplateTableData[] | undefined,
  pollingStartTime: number | null
) {
  return templates && hasActiveWorkflowRuns(templates) && !pollingStartTime;
}

function shouldStopPolling(
  templates: WorkflowRunTemplateTableData[] | undefined
) {
  return !templates || !hasActiveWorkflowRuns(templates);
}

function getPollingInterval(elapsedTimeMs: number): number {
  return elapsedTimeMs < FAST_POLLING_TIME_WINDOW_MS
    ? FAST_POLLING_INTERVAL_MS
    : SLOW_POLLING_INTERVAL_MS;
}

function createWorkflowRunName(templateName: string): string {
  return `${templateName}-ui-triggered`;
}

function getWorkflowRunTooltipId(run: WorkflowRunData): string {
  return `${run.namespace}/${run.name}`;
}
function computePollingInterval(
  templates: WorkflowRunTemplateTableData[] | undefined,
  pollingStartTime: number | null,
  setPollingStartTime: (time: number) => void
) {
  if (!pollingStartTime || shouldStopPolling(templates))
    return false;

  if (shouldStartPolling(templates, pollingStartTime)) {
    setPollingStartTime(Date.now());
  }

  const elapsedTimeMs = Date.now() - pollingStartTime;
  return getPollingInterval(elapsedTimeMs);
}

export function WorkflowRunTemplateDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const { templateNamespace, templateName } = useParams();
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  const { mutate: createWorkflowRunFromRunTemplate } =
    useCreateWorkflowRunFromRunTemplate({
      onError: (error: AxiosError<ApiHttpError>) =>
        handleDefaultApiHttpError(
          error,
          "Error while trying to create Workflow Run"
        ),
      onSuccess: () => {
        workflowRunTemplatesRefetch();
        toast.success("Workflow Run created successfully");
        setPollingStartTime(Date.now());
      },
    });

  const startWorkflowRun = useCallback(
    (namespace: string, name: string) => {
      createWorkflowRunFromRunTemplate({
        runTemplateNamespace: namespace,
        runTemplateName: name,
        runName: createWorkflowRunName(name),
      });
    },
    [createWorkflowRunFromRunTemplate]
  );

  const renderWorkflowRunStatusBadges = useCallback(
    (runs: WorkflowRunData[]) => {
      if (!runs || runs.length === 0) {
        return <span className="text-muted-foreground">No runs</span>;
      }

      const recentRuns = getRecentWorkflowRuns(runs);

      return (
        <div className="flex flex-wrap gap-1 items-center animate-in fade-in-0 duration-300 delay-200 fill-mode-both">
          {recentRuns.map(
            (run: WorkflowRunData, index: number, array: WorkflowRunData[]) => (
              <WorkflowRunStatusBadge
                key={getWorkflowRunTooltipId(run)}
                run={run}
                templateNamespace={templateNamespace}
                templateName={templateName}
                isLastRun={index === array.length - 1}
              />
            )
          )}
        </div>
      );
    },
    [templateNamespace, templateName]
  );

  const columns = useMemo(
    () =>
      defineColumns<WorkflowRunTemplateTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("runPolicy", {
          header: "Run Policy",
          cell: (info) =>
            info.getValue() === "" ? (
              <span className="text-muted-foreground">No policy</span>
            ) : (
              info.getValue()
            ),
        }),
        columnHelper.accessor("lastRuns", {
          header: "Last Runs",
          cell: (info) => renderWorkflowRunStatusBadges(info.getValue()),
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end gap-2 items-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  startWorkflowRun(
                    props.row.original.namespace,
                    props.row.original.name
                  )
                }
              >
                <LucidePlay />
                Start Workflow Run
              </Button>
              <div>
                {(
                  props.table.options.meta as WorkflowRunTemplateTableMeta
                )?.renderRowActions?.(props.row.original)}
              </div>
            </div>
          ),
        }),
      ]),
    [startWorkflowRun, renderWorkflowRunStatusBadges]
  );

  const workflowRunTemplateTableMeta: WorkflowRunTemplateTableMeta = {
    renderRowActions: (row) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => event.stopPropagation()}
            >
              <LucideMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <FeatureItemDeleteAction
              featureType={"Run Template"}
              featureID={`${row.namespace}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                deleteWorkflowRunTemplate(row.namespace, row.name);
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete Run Template
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  const {
    data: workflowRunTemplatesData,
    refetch: workflowRunTemplatesRefetch,
    isLoading: isLoadingWorkflowRunTemplates,
    isError: isErrorWorkflowRunTemplates,
    isRefetchError: isRefetchErrorWorkflowRunTemplates,
    error: workflowRunTemplatesError,
  } = useGetWorkflowRunTemplatesByTemplate(
    {
      templateNamespace: templateNamespace ?? "",
      templateName: templateName ?? "",
    },
    {
      enabled: !!templateNamespace && !!templateName,
      refetchInterval: (query) =>
        computePollingInterval(
          query.state.data,
          pollingStartTime,
          setPollingStartTime
        ),
    }
  );

  const workflowRunTemplates = useMemo(() => {
    if (!workflowRunTemplatesData) return [];
    return workflowRunTemplatesData;
  }, [workflowRunTemplatesData]);

  const { mutate: deleteWorkflowRunTemplateMutation } =
    useDeleteWorkflowRunTemplate({
      onError: (error: AxiosError<ApiHttpError>) =>
        handleDefaultApiHttpError(
          error,
          "Error while trying to delete Run Template"
        ),
      onSuccess: () => {
        workflowRunTemplatesRefetch();
        toast.success("Run Template deleted successfully");
      },
    });

  const deleteWorkflowRunTemplate = useCallback(
    (namespace: string, name: string) => {
      deleteWorkflowRunTemplateMutation({ namespace, name });
    },
    [deleteWorkflowRunTemplateMutation]
  );

  if (isErrorWorkflowRunTemplates || isRefetchErrorWorkflowRunTemplates) {
    handleDefaultApiHttpError(
      workflowRunTemplatesError,
      "Error while fetching Run Templates data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={workflowRunTemplates}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingWorkflowRunTemplates}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        emptyMessage={"No Run Template available"}
        meta={workflowRunTemplateTableMeta}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold w-auto">Associated Run Templates</h2>
          </div>
          <div className="flex justify-end gap-4">
            <DataSearch />
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  getOrgLink(
                    `/automation/workflows/${templateNamespace}/${templateName}/create`
                  )
                )
              }
            >
              <LucidePlus />
              Add Run Template
            </Button>
          </div>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
