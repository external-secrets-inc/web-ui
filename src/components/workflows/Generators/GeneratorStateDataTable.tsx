import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { Button } from "@/components/ui/button";
import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import useDeleteGeneratorState from "@/services/workflows/mutations/useDeleteGeneratorState";
import useGetGeneratorStatesByResource from "@/services/workflows/queries/useGetGeneratorStatesByResource";
import type { ApiHttpError } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { AxiosError } from "axios";
import { LucideMoreVertical, LucideTrash2 } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { StatusMap } from "../Common.interfaces";
import { StatusBadge } from "../StatusBadge";
import { GeneratorStateTableData } from "./Generators.interfaces";

interface GeneratorStateTableMeta {
  renderRowActions?: (row: GeneratorStateTableData) => React.ReactNode;
}

const GENERATOR_STATE_STATUS_MAP: StatusMap = {
  Ready: {
    variant: "success",
    display: "In Use",
  },
  "Deletion Scheduled": {
    variant: "warning",
    display: "Deletion Scheduled",
  },
  Terminating: {
    variant: "destructive",
    display: "Terminating",
  },
  "Pending Deletion": {
    variant: "destructive",
    display: "Pending Deletion",
  },
};

function formatGeneratorStateMessage(message?: string): React.ReactNode {
  if (!message) {
    return message;
  }

  const deletionPrefix = "Deletion scheduled to: ";
  const nextCheckPrefix = "State still active. Next check in ";

  if (message.startsWith(deletionPrefix)) {
    try {
      const dateTimeStr = message.substring(deletionPrefix.length).trim();
      const formatted = formatDate(dateTimeStr, { format: "readableDate" });

      if (formatted !== "Invalid date") {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              Deletion scheduled to:
            </span>
            <span className="font-medium">{formatted}</span>
          </div>
        );
      }
    } catch {
      // Parsing failed, return original message
    }
  }

  if (message.startsWith(nextCheckPrefix)) {
    const duration = message.substring(nextCheckPrefix.length).trim();
    return (
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">
          State still active.
        </span>
        <span className="font-medium">Next check in {duration}</span>
      </div>
    );
  }

  const colonIndex = message.indexOf(": ");
  if (colonIndex !== -1) {
    const label = message.substring(0, colonIndex);
    const value = message.substring(colonIndex + 2).trim();
    return (
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  }

  return message;
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
          cell: (info) => (
            <StatusBadge
              statusData={info.row.original.status}
              map={GENERATOR_STATE_STATUS_MAP}
              unknownMessage="GeneratorState status information is not available"
              defaultDisplay="Not Informed"
              defaultMessage="Status not mapped"
              formatFunction={formatGeneratorStateMessage}
            />
          ),
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
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <LucideMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
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
        <h2 className="font-bold w-auto">Associated Generator States</h2>
        <DataTable />
      </DataProvider>
    </div>
  );
}
