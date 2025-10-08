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
import { AuthorizationTableData, FederationRef } from "./Authorizations.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteAuthorization from "@/services/federations/mutations/useDeleteAuthorization";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import useGetAuthorizations from "@/services/federations/queries/useGetAuthorizations";

interface AuthorizationTableMeta {
  renderRowActions?: (row: AuthorizationTableData) => React.ReactNode;
}

export function AuthorizationDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<AuthorizationTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("federationRef", {
          header: "Identity Provider",
          cell: (info) => {
            const { name, kind } : FederationRef = info.getValue();
            return `${name} (${kind})`
          }
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as AuthorizationTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const authorizationTableMeta: AuthorizationTableMeta = {
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
              featureType={"Authorization"}
              featureID={`${row.name}`}
              featureName={row.name}
              onDelete={() => {
                performDelete(row.name);
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
    data: authorizationsData,
    isLoading: isLoadingAuthorizations,
    isError: isErrorAuthorizations,
    isRefetchError: isRefetchErrorAuthorizations,
    error: authorizationError,
    refetch: authorizationsRefetch,
  } = useGetAuthorizations();

  const authorizations = useMemo(() => {
    return authorizationsData || [];
  }, [authorizationsData]);

  const { mutate: deleteAuthorization } = useDeleteAuthorization({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Authorization"
      ),
    onSuccess: () => {
      authorizationsRefetch();
      toast.success("Authorization deleted successfully");
    },
  });

  const performDelete = (name: string) => {
    deleteAuthorization({ name });
  };

  if (isErrorAuthorizations || isRefetchErrorAuthorizations) {
      handleDefaultApiHttpError(authorizationError, "Error while fetching Authorizations data");
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={authorizations}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingAuthorizations}
        getRowId={(row) => `${row.name}`}
        meta={authorizationTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() =>
              navigate(getOrgLink("/federation/authorizations/create"))
            }
          >
            <LucidePlus />
            Add Authorization
          </Button>
        </div>
        <DataTable
        onRowClick={(row) => {
                    const typedRow = row as AuthorizationTableData;
                    navigate(
                      getOrgLink(
                        `/federation/authorizations/${typedRow.name}`
                      )
                    );
                  }}
        />
      </DataProvider>
    </div>
  );
}
