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
import { TargetTableData } from "./Targets.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteTarget from "@/services/workflows/mutations/useDeleteTarget";
import useGetTargets from "@/services/workflows/queries/useGetTargets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { Badge } from "@/components/ui/badge";
import { TargetStatusBadge } from "./TargetStatusBadge";

interface TargetTableMeta {
  renderRowActions?: (row: TargetTableData) => React.ReactNode;
}

export function TargetDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<TargetTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("kind", {
          header: "Type",
          cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const statusData = info.row.original.status;
            return <TargetStatusBadge statusData={statusData} />
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as TargetTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const targetTableMeta: TargetTableMeta = {
    renderRowActions: (row) => (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <LucideMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <FeatureItemDeleteAction
              featureType={"Target"}
              featureID={`${row.kind}/${row.namespace}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.kind, row.namespace, row.name);
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  const {
    data: targetsData,
    refetch: targetsRefetch,
    isLoading: isLoadingTargets,
    isError: isErrorTargets,
    isRefetchError: isRefetchErrorTargets,
    error: targetsError,
  } = useGetTargets();

  const targets = useMemo(() => {
    return targetsData || [];
  }, [targetsData]);

  const { mutate: deleteTarget } = useDeleteTarget({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Target"
      ),
    onSuccess: () => {
      targetsRefetch();
      toast.success("Target deleted successfully");
    },
  });

  const performDelete = (kind: string, namespace: string, name: string) => {
    deleteTarget({ kind, namespace, name });
  };

  if (isErrorTargets || isRefetchErrorTargets) {
    handleDefaultApiHttpError(
      targetsError,
      "Error while fetching Targets data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={targets}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingTargets}
        getRowId={(row) => `${row.kind}/${row.namespace}/${row.name}`}
        meta={targetTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() => navigate(getOrgLink("/resources/targets/create"))}
          >
            <LucidePlus />
            Add Target
          </Button>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
