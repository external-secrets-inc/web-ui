import { useMemo } from "react";
import { LucideMoreVertical, LucidePlus, LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataProvider,
  DataSearch,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { WorkflowTemplateTableData } from "./Workflows.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteWorkflowTemplate from "@/services/workflows/mutations/useDeleteWorkflowTemplate";
import useGetWorkflowTemplates from "@/services/workflows/queries/useGetWorkflowTemplates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";

interface WorkflowTemplateTableMeta {
  renderRowActions?: (row: WorkflowTemplateTableData) => React.ReactNode;
}

export function WorkflowTemplateDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<WorkflowTemplateTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end gap-2 items-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    getOrgLink(
                      `/workflows/templates/${props.row.original.namespace}/${props.row.original.name}/create`
                    )
                  );
                }}
              >
                <LucidePlus />
                Add Run Template
              </Button>
              <div>
                {(
                  props.table.options.meta as WorkflowTemplateTableMeta
                )?.renderRowActions?.(props.row.original)}
              </div>
            </div>
          ),
        }),
      ]),
    [getOrgLink, navigate]
  );

  const workflowTemplateTableMeta: WorkflowTemplateTableMeta = {
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
                Delete Workflow Template
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
            <DropdownMenuItem
              onSelect={() => {
                navigate(
                  getOrgLink(
                    `/workflows/templates/${row.namespace}/${row.name}/create`
                  )
                );
              }}
            >
              <LucidePlus className="mr-2" />
              Add Run Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  const {
    data: workflowTemplatesData,
    refetch: workflowTemplatesRefetch,
    isLoading: isLoadingWorkflowTemplates,
    isError: isErrorWorkflowTemplates,
    isRefetchError: isRefetchErrorWorkflowTemplates,
    error: workflowTemplatesError,
  } = useGetWorkflowTemplates();

  const workflowTemplates = useMemo(() => {
    if (!workflowTemplatesData) return [];
    return workflowTemplatesData;
  }, [workflowTemplatesData]);

  const { mutate: deleteWorkflowTemplate } = useDeleteWorkflowTemplate({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Workflow Template"
      ),
    onSuccess: () => {
      workflowTemplatesRefetch();
      toast.success("Workflow Template deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteWorkflowTemplate({ namespace, name });
  };

  if (isErrorWorkflowTemplates || isRefetchErrorWorkflowTemplates) {
    handleDefaultApiHttpError(
      workflowTemplatesError,
      "Error while fetching Workflow Templates data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={workflowTemplates}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingWorkflowTemplates}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        meta={workflowTemplateTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() => navigate(getOrgLink("/workflows/templates/create"))}
          >
            <LucidePlus />
            Add Workflow Template
          </Button>
        </div>
        <DataTable
          onRowClick={(row) => {
            const typedRow = row as WorkflowTemplateTableData;
            navigate(
              getOrgLink(
                `/workflows/templates/${typedRow.namespace}/${typedRow.name}`
              )
            );
          }}
        />
      </DataProvider>
    </div>
  );
}
