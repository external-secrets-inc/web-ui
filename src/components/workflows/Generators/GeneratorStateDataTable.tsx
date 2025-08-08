import { useMemo } from "react";
import { LucideMoreVertical, LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { GeneratorStateTableData } from "./Generators.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteGeneratorState from "@/services/workflows/mutations/useDeleteGeneratorState";
import useGetGeneratorStatesByResource from "@/services/workflows/queries/useGetGeneratorStatesByResource";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { useParams } from "react-router-dom";

interface GeneratorStateTableMeta {
  renderRowActions?: (row: GeneratorStateTableData) => React.ReactNode;
}

export function GeneratorStateDataTable() {
  const { generatorNamespace, generatorName } = useParams();
  const columns = useMemo(
    () =>
      defineColumns<GeneratorStateTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const statusData = info.row.original.status;
            if (!statusData) {
              return <Badge variant="secondary">Unknown</Badge>;
            }

            const { status, reason } = statusData;
            let variantClass: BadgeProps["variant"] = "default";
            let displayText = "Not Informed";

            if (status === "Pending") {
              variantClass = "warning";
              displayText = "Pending";
            } else if (status === "True") {
              variantClass = "success";
              displayText = reason || "Ready";
            } else if (status === "False") {
              variantClass = "destructive";
              displayText = reason || "Error";
            }
            return <Badge variant={variantClass}>{displayText}</Badge>;
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as GeneratorStateTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const generatorTableMeta: GeneratorStateTableMeta = {
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
              featureType={"GeneratorState"}
              featureID={`${row.namespace}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.namespace, row.name);
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="text-destructive mr-2" />
                <span className="text-destructive">Force Delete</span>
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  };

  const {
    data: generatorsData,
    refetch: generatorsRefetch,
    isLoading: isLoadingGeneratorStates,
    isError: isErrorGeneratorStates,
    isRefetchError: isRefetchErrorGeneratorStates,
    error: generatorsError,
  } = useGetGeneratorStatesByResource({
    resourceNamespace: generatorNamespace ?? "",
    resourceName: generatorName ?? "",
  });

  const generators = useMemo(() => {
    return generatorsData || [];
  }, [generatorsData]);

  const { mutate: deleteGeneratorState } = useDeleteGeneratorState({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete GeneratorState"
      ),
    onSuccess: () => {
      generatorsRefetch();
      toast.success("GeneratorState deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteGeneratorState({ namespace, name });
  };

  if (isErrorGeneratorStates || isRefetchErrorGeneratorStates) {
    handleDefaultApiHttpError(
      generatorsError,
      "Error while fetching GeneratorStates data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={generators}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingGeneratorStates}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        meta={generatorTableMeta}
      >
        <DataTable />
      </DataProvider>
    </div>
  );
}
