import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { LucidePlus } from "lucide-react";
import { Button } from "../ui/button";
import { DataProvider, DataTable } from "../ui/DataProvider";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import AddProviderDialogForm from "./AddProviderDialogForm";
import { CreateProviderPayload, ProviderTableData } from "./Audit.interfaces";
import { createColumnHelper } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useCreateProvider from "@/services/audit/mutations/useCreateProvider";
import useDeleteProvider from "@/services/audit/mutations/useDeleteProvider";
import useGetProviders from "@/services/audit/queries/useGetProviders";

function AuditProvider() {
  const columnHelper = createColumnHelper<ProviderTableData>()

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => info.getValue()
    }),
  ], [columnHelper])

  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);

  const { data: providersData, refetch: providersRefetch, isLoading: providersIsLoading, isError: providersIsError, isRefetchError: providersIsRefetchError, error: providersError } = useGetProviders(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const providers = useMemo(() => {
    if (!providersData) return []

    return providersData;
  }, [providersData]);

  const { mutate: createProvider } = useCreateProvider(true, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create Provider"),
    onSuccess: () => {
      providersRefetch();
      toast.success("Provider created successfully")
    }
  });

  const { mutate: deleteProvider } = useDeleteProvider(true, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete Provider"),
    onSuccess: () => {
      providersRefetch();
      toast.success("Provider deleted successfully")
    },
  })

  const performCreate = (payload: CreateProviderPayload) => {
    createProvider(payload)
  }

  const performDelete = (providerId: string) => {
    deleteProvider({ id: providerId });
  }

  useEffect(() => {
    if (!(providersError || providersIsRefetchError)) return;

    handleDefaultApiHttpError(providersError, "Error while fetching listener Audit data")
  }, [providersError, providersIsError, providersIsRefetchError])

  const handleAddProviderDialogOpenChange = (isOpen: boolean) => {
    setIsAddProviderDialogOpen(isOpen);
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">Providers</h2>
        <Dialog open={isAddProviderDialogOpen} onOpenChange={handleAddProviderDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="self-center min-[260px]:self-end"
              aria-label="Add Provider"
              title="Add Provider"
            >
              <LucidePlus />
            </Button>
          </DialogTrigger>
          <AddProviderDialogForm
            onSubmit={() => { handleAddProviderDialogOpenChange(false) }}
            onCancel={() => { handleAddProviderDialogOpenChange(false) }}
          />
        </Dialog>
      </div>
      <DataProvider
        data={providers}
        columns={columns}
        initialSort={{ id: 'lastRotation', desc: true }}
        isLoading={providersIsLoading}
      >
        <DataTable />
      </DataProvider>
    </>
  )
}

export default AuditProvider
