import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { LucideEdit, LucideMoreVertical, LucidePlus, LucideTrash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataProvider, DataTable, defineColumns } from "@/components/ui/DataProvider";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import ProviderDialogForm from "./ProviderDialogForm.tsx";
import { AddProviderFormValues, CreateProviderPayload, ProviderTableData } from "./Audit.interfaces";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { toast } from "sonner";
import useCreateAuditProvider from "@/services/audit/mutations/useCreateAuditProvider";
import useDeleteAuditProvider from "@/services/audit/mutations/useDeleteAuditProvider";
import useGetAuditProviders from "@/services/audit/queries/useGetAuditProviders";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction" // TODO[cfviotti]: We should not import components from non generic stuff! This should be a generic component, or re-implemented here.
import useEditProvider, { EditProviderVariables } from "@/services/audit/mutations/useEditProvider";
import useGetProvidersTypes from "@/services/audit/queries/useGetProvidersType";
import { AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants.ts";

interface ProviderTableMeta {
  renderRowActions?: (row: ProviderTableData) => React.ReactNode;
}

function AuditProviderDataTable({ tenantID, listenerID }: { tenantID: string, listenerID: string }) {
  const columns = useMemo(() => defineColumns<ProviderTableData>(columnHelper => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('backendType', {
      header: 'Type',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as ProviderTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ]), []);

  const { data: providersTypeData, isLoading: isLoadingProvidersTypes, isError: isErrorProvidersTypes } = useGetProvidersTypes(true, {
    staleTime: AUDIT_QUERY_STALE_TIME,
  });

  const isValidProviderType: { (row: ProviderTableData): boolean } = (row) => {
    if (isErrorProvidersTypes) {
      toast.error("Unable to fetch provider types. Please try again later.");
      return false;
    }

    if (isLoadingProvidersTypes) {
      toast("Provider types are still loading. Please wait.");
      return false;
    }

    const isValidType = providersTypeData && providersTypeData[row.backendType] !== undefined;
    if (!isValidType) {
      toast.error("Warning: The provider's type is invalid. Please delete this entry and recreate it to avoid potential errors.");
      return false;
    }

    return true;
  };

  const providerTableMeta: ProviderTableMeta = {
    renderRowActions: (row) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => event.stopPropagation()}
            >
              <LucideMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                if (!isValidProviderType(row)) return;
                setSelectedProviderId(row.providerID);
                setProviderForm({
                  providerName: row.name,
                  backendIdentifier: row.backendIdentifier,
                  providerType: row.backendType,
                  ...row.config
                });
                setIsAddProviderDialogOpen(true);
              }}
            >
              <LucideEdit className="mr-2" />
              Edit Provider
            </DropdownMenuItem>
            <FeatureItemDeleteAction
              featureType={"Audit Provider"}
              featureID={row.providerID}
              featureName={row.name}
              onDelete={() => { performDelete(row.providerID) }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete Provider
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  };

  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const defaultFormValues = {
    providerName: "",
    backendIdentifier: "",
    providerType: "",
  };
  const [providerForm, setProviderForm] = useState<AddProviderFormValues>(defaultFormValues);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const {
    data: providersData,
    refetch: providersRefetch,
    isLoading: isLoadingProviders,
    isError: isErrorProviders,
    isRefetchError: isRefetchErrorProviders,
    error: providersError } = useGetAuditProviders(false, listenerID || '', {
      staleTime: AUDIT_QUERY_STALE_TIME,
      enabled: !!listenerID
    }
    );

  const providers = useMemo(() => {
    if (!providersData) return []

    return providersData;
  }, [providersData]);

  const { mutateAsync: createProvider } = useCreateAuditProvider(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create Provider"),
    onSuccess: () => {
      providersRefetch();
      toast.success("Provider created successfully")
    }
  });

  const { mutateAsync: editProvider } = useEditProvider(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to edit Provider"),
    onSuccess: () => {
      providersRefetch();
      toast.success("Provider edited successfully")
    },
  });

  const { mutate: deleteProvider } = useDeleteAuditProvider(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete Provider"),
    onSuccess: () => {
      providersRefetch();
      toast.success("Provider deleted successfully")
    },
  });

  const performCreate = async (payload: CreateProviderPayload) => {
    payload.tenantID = tenantID;
    payload.listenerID = listenerID;
    await createProvider(payload);
  }

  const performEdit = async (editPayload: EditProviderVariables) => {
    await editProvider(editPayload);
  }

  const performDelete = (providerId: string) => {
    deleteProvider({ id: providerId });
  }

  const handleSubmit = async (payload: CreateProviderPayload) => {
    if (selectedProviderId) {
      const { name, backendIdentifier, backendType, config } = { ...payload };
      const editPayload = { providerID: selectedProviderId, payload: { name, backendIdentifier, backendType, config } };
      await performEdit(editPayload);
    } else {
      await performCreate(payload);
    }
    handleAddProviderDialogOpenChange(false);
  }

  useEffect(() => {
    if (!(providersError || isRefetchErrorProviders)) return;

    handleDefaultApiHttpError(providersError, "Error while fetching listener Audit data")
  }, [providersError, isErrorProviders, isRefetchErrorProviders])

  const handleAddProviderDialogOpenChange = (isOpen: boolean) => {
    setIsAddProviderDialogOpen(isOpen);
    setProviderForm(defaultFormValues);
    setSelectedProviderId("");
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">Providers</h2>
        <Dialog open={isAddProviderDialogOpen} onOpenChange={handleAddProviderDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LucidePlus />
              Add Provider
            </Button>
          </DialogTrigger>
          <ProviderDialogForm
            selectedProviderId={selectedProviderId}
            providerForm={providerForm}
            open={isAddProviderDialogOpen}
            onSubmit={handleSubmit}
            onCancel={() => { handleAddProviderDialogOpenChange(false) }}
          />
        </Dialog>
      </div>
      <DataProvider
        data={providers}
        columns={columns}
        initialSort={{ id: 'name', desc: false }}
        isLoading={isLoadingProviders}
        getRowId={row => row.providerID}
      >
        <DataTable
          meta={providerTableMeta}
        />
      </DataProvider>
    </>
  )
}

export default AuditProviderDataTable
