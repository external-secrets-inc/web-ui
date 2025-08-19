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
import { SecretTableData } from "./Secrets.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useDeleteSecret from "@/services/workflows/mutations/useDeleteSecret";
import useGetSecrets from "@/services/workflows/queries/useGetSecrets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";

interface SecretTableMeta {
  renderRowActions?: (row: SecretTableData) => React.ReactNode;
}

export function SecretDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const columns = useMemo(
    () =>
      defineColumns<SecretTableData>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("content", {
          header: "Content",
          cell: (info) => {
            const content = info.getValue() as Record<string, string>;
            const keys = Object.keys(content);
            return keys.join(", ");
          },
        }),
        columnHelper.display({
          id: "actions",
          cell: (props) => (
            <div className="flex justify-end">
              {(
                props.table.options.meta as SecretTableMeta
              )?.renderRowActions?.(props.row.original)}
            </div>
          ),
        }),
      ]),
    []
  );

  const secretTableMeta: SecretTableMeta = {
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
              featureType={"Secret"}
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
    data: secretsData,
    refetch: secretsRefetch,
    isLoading: isLoadingSecrets,
    isError: isErrorSecrets,
    isRefetchError: isRefetchErrorSecrets,
    error: secretsError,
  } = useGetSecrets();

  const secrets = useMemo(() => {
    return secretsData || [];
  }, [secretsData]);

  const { mutate: deleteSecret } = useDeleteSecret({
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to delete Secret"
      ),
    onSuccess: () => {
      secretsRefetch();
      toast.success("Secret deleted successfully");
    },
  });

  const performDelete = (namespace: string, name: string) => {
    deleteSecret({ namespace, name });
  };

  if (isErrorSecrets || isRefetchErrorSecrets) {
    handleDefaultApiHttpError(
      secretsError,
      "Error while fetching Secrets data"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DataProvider
        data={secrets}
        columns={columns}
        initialSort={{ id: "name", desc: false }}
        isLoading={isLoadingSecrets}
        getRowId={(row) => `${row.namespace}/${row.name}`}
        meta={secretTableMeta}
      >
        <div className="flex justify-end gap-4 items-center">
          <DataSearch />
          <Button
            variant="outline"
            onClick={() =>
              navigate(getOrgLink("/resources/secrets/create"))
            }
          >
            <LucidePlus />
            Add Secret
          </Button>
        </div>
        <DataTable />
      </DataProvider>
    </div>
  );
}
