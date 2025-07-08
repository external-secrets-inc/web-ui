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
import { SecretStoreTableData } from "./SecretStores.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteSecretStore from "@/services/workflows/mutations/useDeleteSecretStore";
import useGetSecretStores from "@/services/workflows/queries/useGetSecretStores";
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

interface SecretStoreTableMeta {
  renderRowActions?: (row: SecretStoreTableData) => React.ReactNode;
}

export function SecretStoreDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<SecretStoreTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("capabilities", {
          header: "Available as",
          cell: (info) => {
            const capabilities = info.getValue();
            let availableAs = "";
            if (capabilities === "ReadOnly") {
              availableAs = "Source";
            } else if (capabilities === "ReadWrite") {
              availableAs = "Source / Destination";
            } else if (capabilities === "WriteOnly") {
              availableAs = "Destination";
            }

            return availableAs;
          },
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
                props.table.options.meta as SecretStoreTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const secretStoreTableMeta: SecretStoreTableMeta = {
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
              featureType={"Secret Store"}
              featureID={`${row.namespace}/${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.namespace, row.name);
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
    data: secretStoresData,
    refetch: secretStoresRefetch,
    isLoading: isLoadingSecretStores,
    isError: isErrorSecretStores,
    isRefetchError: isRefetchErrorSecretStores,
    error: secretStoresError,
  } = useGetSecretStores({
    staleTime: 30000,
  });

  const secretStores = useMemo(() => {
    return secretStoresData || [];
  }, [secretStoresData]);

  const { mutate: deleteSecretStore } = useDeleteSecretStore({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Secret Store"
      ),
    onSuccess: () => {
      secretStoresRefetch();
      toast.success("Secret Store deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteSecretStore({ namespace, name });
  };

  if (isErrorSecretStores || isRefetchErrorSecretStores) {
    handleDefaultApiHttpError(
      secretStoresError,
      "Error while fetching Secret Stores data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={secretStores}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingSecretStores}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        meta={secretStoreTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() =>
              navigate(getOrgLink("/workflows/secret-stores/create"))
            }
          >
            <LucidePlus />
            Add Secret Store
          </Button>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
