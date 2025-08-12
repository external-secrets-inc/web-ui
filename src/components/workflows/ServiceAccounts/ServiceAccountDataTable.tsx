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
import { ServiceAccountTableData } from "./ServiceAccounts.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteServiceAccount from "@/services/workflows/mutations/useDeleteServiceAccount";
import useGetServiceAccounts from "@/services/workflows/queries/useGetServiceAccounts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";

interface ServiceAccountTableMeta {
  renderRowActions?: (row: ServiceAccountTableData) => React.ReactNode;
}

export function ServiceAccountDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<ServiceAccountTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as ServiceAccountTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const serviceAccountTableMeta: ServiceAccountTableMeta = {
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
              featureType={"ServiceAccount"}
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
    data: serviceAccountsData,
    refetch: serviceAccountsRefetch,
    isLoading: isLoadingServiceAccounts,
    isError: isErrorServiceAccounts,
    isRefetchError: isRefetchErrorServiceAccounts,
    error: serviceAccountsError,
  } = useGetServiceAccounts();

  const serviceAccounts = useMemo(() => {
    return serviceAccountsData || [];
  }, [serviceAccountsData]);

  const { mutate: deleteServiceAccount } = useDeleteServiceAccount({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Service Account"
      ),
    onSuccess: () => {
      serviceAccountsRefetch();
      toast.success("ServiceAccount deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteServiceAccount({ namespace, name });
  };

  if (isErrorServiceAccounts || isRefetchErrorServiceAccounts) {
    handleDefaultApiHttpError(
      serviceAccountsError,
      "Error while fetching ServiceAccounts data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={serviceAccounts}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingServiceAccounts}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        meta={serviceAccountTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() =>
              navigate(getOrgLink("/resources/service-accounts/create"))
            }
          >
            <LucidePlus />
            Add ServiceAccount
          </Button>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
