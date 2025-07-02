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
import { GeneratorTableData } from "./Generators.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteGenerator from "@/services/workflows/mutations/useDeleteGenerator";
import useGetGenerators from "@/services/workflows/queries/useGetGenerators";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { Badge, BadgeProps } from "@/components/ui/badge";

interface GeneratorTableMeta {
  renderRowActions?: (row: GeneratorTableData) => React.ReactNode;
}

export function GeneratorDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<GeneratorTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("namespace", {
          header: "Namespace",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("kind", {
          header: "Type",
          cell: (info) => (
            <Badge variant="secondary">{info.getValue()}</Badge>
          ),
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
                props.table.options.meta as GeneratorTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const generatorTableMeta: GeneratorTableMeta = {
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
              featureType={"Generator"}
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
    data: generatorsData,
    refetch: generatorsRefetch,
    isLoading: isLoadingGenerators,
    isError: isErrorGenerators,
    isRefetchError: isRefetchErrorGenerators,
    error: generatorsError,
  } = useGetGenerators({
    staleTime: 30000,
  });

  const generators = useMemo(() => {
    return generatorsData || [];
  }, [generatorsData]);

  const { mutate: deleteGenerator } = useDeleteGenerator({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Generator"
      ),
    onSuccess: () => {
      generatorsRefetch();
      toast.success("Generator deleted successfully");
    },
  });

  const performDelete = (kind: string, namespace: string, name: string) => {
    deleteGenerator({ kind, namespace, name });
  };

  if (isErrorGenerators || isRefetchErrorGenerators) {
    handleDefaultApiHttpError(
      generatorsError,
      "Error while fetching Generators data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={generators}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingGenerators}
        getRowId={(row) => `${row.kind}/${row.namespace}/${row.name}`}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() => navigate(getOrgLink("/workflows/generators/create"))}
          >
            <LucidePlus />
            Add Generator
          </Button>
        </div>
        <DataTable meta={generatorTableMeta} />
      </DataProvider>
    </div>
  );
}