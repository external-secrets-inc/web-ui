import { useCallback, useMemo } from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  LucideMoreVertical,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataProvider,
  DataSearch,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import {
  WorkflowRunData,
  WorkflowRunTemplateTableData,
} from "./Workflows.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteWorkflowRunTemplate from "@/services/workflows/mutations/useDeleteWorkflowRunTemplate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { formatDate } from "@/utils/dateUtils";
import useCreateWorkflowRunFromRunTemplate from "@/services/workflows/mutations/useCreateWorkflowRunFromRunTemplate";
import useGetWorkflowRunTemplatesByTemplate from "@/services/workflows/queries/useGetWorkflowRunTemplatesByTemplate";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkflowRunTemplateTableMeta {
  renderRowActions?: (row: WorkflowRunTemplateTableData) => React.ReactNode;
}

export function WorkflowRunTemplateDataTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const getOrgLink = useOrgLink();
  const { templateNamespace, templateName } = useParams();

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
      },
    });

  const performCreateWorkflowRunFromRunTemplate = useCallback(
    (namespace: string, name: string) => {
      createWorkflowRunFromRunTemplate({
        runTemplateNamespace: namespace,
        runTemplateName: name,
        runName: name + "-ui-triggered",
      });
    },
    [createWorkflowRunFromRunTemplate]
  );

  const columns = useMemo(
    () =>
      defineColumns<WorkflowRunTemplateTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("namespace", {
          header: "Namespace",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const { status, reason } = info.row.original.status;
            let variantClass: BadgeProps["variant"] = "default";
            let displayText = "Not Informed";

            if (status === "Pending") {
              variantClass = "warning";
              displayText = "Pending";
            } else if (status === "True") {
              variantClass = "success";
              displayText = reason;
            } else if (status === "False") {
              variantClass = "destructive";
              displayText = reason;
            }
            return <Badge variant={variantClass}>{displayText}</Badge>;
          },
        }),
        columnHelper.accessor("runPolicy", {
          header: "Run Policy",
          cell: (info) =>
            info.getValue() == "" ? (
              <span className="text-muted-foreground">No policy</span>
            ) : (
              info.getValue()
            ),
        }),
        columnHelper.accessor("lastRuns", {
          header: "Last Runs",
          cell: (info) => {
            const runs: WorkflowRunData[] = info.getValue();

            // TODO[iurisevero]: Remove test runs
            const testRuns: WorkflowRunData[] = [
              {
                name: "run-success-1",
                namespace: "default",
                templateRef: { name: "template-a", namespace: "default" },
                parameters: {},
                variables: {},
                phase: "Succeeded",
                startTime: new Date("2025-06-20T10:00:00Z"),
                completionTime: new Date("2025-06-20T10:05:00Z"),
              },
              {
                name: "run-pending-1",
                namespace: "default",
                templateRef: { name: "template-b", namespace: "default" },
                parameters: {},
                variables: {},
                phase: "Pending",
                startTime: new Date("2025-06-21T11:00:00Z"),
                completionTime: undefined,
              },
              {
                name: "run-failed-1",
                namespace: "default",
                templateRef: { name: "template-c", namespace: "default" },
                parameters: {},
                variables: {},
                phase: "Failed",
                startTime: new Date("2025-06-22T12:00:00Z"),
                completionTime: new Date("2025-06-22T12:03:00Z"),
              },
              {
                name: "run-success-2",
                namespace: "default",
                templateRef: { name: "template-d", namespace: "default" },
                parameters: {},
                variables: {},
                phase: "Succeeded",
                startTime: new Date("2025-06-23T13:00:00Z"),
                completionTime: new Date("2025-06-23T13:05:00Z"),
              },
              {
                name: "run-other-1",
                namespace: "default",
                templateRef: { name: "template-e", namespace: "default" },
                parameters: {},
                variables: {},
                phase: "Unknown",
                startTime: new Date("2025-06-24T14:00:00Z"),
                completionTime: new Date("2025-06-24T14:04:00Z"),
              },
            ];

            if (!testRuns && (!runs || runs.length === 0)) {
              return <span className="text-muted-foreground">No runs</span>;
            }

            return (
              <div className="flex flex-wrap gap-1">
                {testRuns.slice(-5).map((run, index) => {
                  let variant: "warning" | "success" | "destructive";

                  switch (run.phase) {
                    case "Pending":
                      variant = "warning";
                      break;
                    case "Succeeded":
                      variant = "success";
                      break;
                    default:
                      variant = "destructive";
                      break;
                  }

                  return (
                    <Tooltip>
                      <TooltipTrigger>
                        <Link
                          to={{
                            pathname: getOrgLink(
                              `/workflows/templates/runtemplates/${templateNamespace}/${templateName}/runs/${run.namespace}/${run.name}`
                            ),
                            search: location.search,
                          }}
                          key={`${run.namespace}/${run.name}`}
                          className="inline-block"
                        >
                          <Badge variant={variant}>{index + 1}</Badge>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                          Name: {run.name}<br/>
                          Phase: {run.phase}<br/>
                          Start: {
                            run.startTime
                              ? formatDate(run.startTime, { format: "full" })
                              : "N/A"
                          }<br/>
                          End: {
                            run.completionTime
                              ? formatDate(run.completionTime, {
                                  format: "full",
                                })
                              : "N/A"
                          }
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end gap-2 items-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  performCreateWorkflowRunFromRunTemplate(
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
    [
      getOrgLink,
      performCreateWorkflowRunFromRunTemplate,
      location,
      templateNamespace,
      templateName,
    ]
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
              featureType={"Workflow Template"}
              featureID={`${row.namespace}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.namespace, row.name);
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete Workflow Run Template
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
      staleTime: 30000,
      enabled: !!templateNamespace && !!templateName,
    }
  );

  const workflowRunTemplates = useMemo(() => {
    if (!workflowRunTemplatesData) return [];
    return workflowRunTemplatesData;
  }, [workflowRunTemplatesData]);

  const { mutate: deleteWorkflowRunTemplate } = useDeleteWorkflowRunTemplate({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Workflow Run Template"
      ),
    onSuccess: () => {
      workflowRunTemplatesRefetch();
      toast.success("Workflow Run Template deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteWorkflowRunTemplate({ namespace, name });
  };

  if (isErrorWorkflowRunTemplates || isRefetchErrorWorkflowRunTemplates) {
    handleDefaultApiHttpError(
      workflowRunTemplatesError,
      "Error while fetching Workflow Templates data"
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
        emptyMessage={"No Workflow Run Template available"}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold w-auto">
              Run Templates
            </h2>
          </div>
          <div className="flex justify-end gap-4">
            <DataSearch />
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  getOrgLink(
                    `/workflows/templates/${templateNamespace}/${templateName}/runtemplates/create`
                  )
                )
              }
            >
              <LucidePlus />
              Add Workflow Run Template
            </Button>
          </div>
        </div>
        <DataTable meta={workflowRunTemplateTableMeta} />
      </DataProvider>
    </div>
  );
}
