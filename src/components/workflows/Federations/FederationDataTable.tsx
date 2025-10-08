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
import { FederationTableData } from "./Federations.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteFederation from "@/services/federations/mutations/useDeleteFederation";
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
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { Loader } from "@/components/ui/Loader";
import { useGetFederationsFromList } from "@/services/federations/queries/useGetFederationsFromList";
import { SelectFieldOptions, SelectOption } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

function normalizeOptionsToStrings(options: SelectFieldOptions): string[] {
  if (!options) return [];

  if (Array.isArray(options) && typeof options[0] === "string") {
    return options as string[];
  }

  if (Array.isArray(options) && typeof options[0] === "object") {
    return (options as SelectOption[])
      .map((opt) => {
        if (typeof opt.value === "string") {
          return opt.value;
        }
        return JSON.stringify(opt.value);
      })
      .filter((v): v is string => Boolean(v));
  }

  return [];
}

interface FederationTableMeta {
  renderRowActions?: (row: FederationTableData) => React.ReactNode;
}

export function FederationDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<FederationTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("kind", {
          header: "Type",
          cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
        }),
        columnHelper.accessor("details", {
          header: "Details",
          cell: (info) => {
            const details = info.getValue();
            if (!details || Object.keys(details).length === 0) {
              return <span className="text-muted-foreground italic">—</span>;
            }

            return (
              <div className="flex flex-col gap-1">
                {Object.entries(details as Record<string, string>).map(([key, value]) => (
                  <div key={key} className="flex text-sm">
                    <span className="text-muted-foreground mr-1">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as FederationTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const federationTableMeta: FederationTableMeta = {
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
              featureType={"Federation"}
              featureID={`${row.kind}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.kind, row.name);
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

  // Get federation types selection schema
  const {
    data: federationTypesSchema,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useGetUISchema("federations");

  // Extract options from the federation types schema
  const federationTypes: string[] = useMemo(() => {
    const federationTypeOptions =
      federationTypesSchema?.fields?.find((field) => field.id === "federations")
        ?.options || [];

    return normalizeOptionsToStrings(federationTypeOptions);
  }, [federationTypesSchema]);

  const {
    data: federationsData,
    isLoading: isLoadingFederations,
    isError: isErrorFederations,
    isRefetchError: isRefetchErrorFederations,
    errors: federationsErrors,
    refetchAll: federationsRefetch,
  } = useGetFederationsFromList(federationTypes);

  const federations = useMemo(() => {
    return federationsData || [];
  }, [federationsData]);

  const { mutate: deleteFederation } = useDeleteFederation({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Federation"
      ),
    onSuccess: () => {
      federationsRefetch();
      toast.success("Federation deleted successfully");
    },
  });

  const performDelete = (kind: string, name: string) => {
    deleteFederation({ kind, name });
  };

  if (isErrorFederations || isRefetchErrorFederations) {
    federationsErrors.forEach((err) => {
      if (err) {
        handleDefaultApiHttpError(err, "Error while fetching Federations data");
      }
    });
  }

  if (isLoadingTypes) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (typesError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load identity provider types. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={federations}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingFederations}
        getRowId={(row) => `${row.kind}/${row.name}`}
        meta={federationTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() =>
              navigate(getOrgLink("/federation/identity-providers/create"))
            }
          >
            <LucidePlus />
            Add Federation
          </Button>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
