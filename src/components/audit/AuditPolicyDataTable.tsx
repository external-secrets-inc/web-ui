import { useEffect, useMemo, useState } from "react";
import { CreatePolicyPayload, PolicyForm, PolicyTableData } from "./Audit.interfaces";
import { createColumnHelper } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { LucideMoreVertical, LucidePlus, LucideTrash2, LucideUsers, LucideAlertCircle, LucideEdit } from "lucide-react";
import { FeatureItemDeleteAction } from "@/components/FeatureCollection/FeatureItemDeleteAction" // TODO: We should not import components from non generic stuff! This should be a generic component, or re-implemented here.
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { DataProvider, DataTable } from "../ui/DataProvider";
import useGetPolicies from "@/services/audit/queries/useGetPolicies";
import useGetAuditProviders from "@/services/audit/queries/useGetAuditProviders";
import useCreatePolicy from "@/services/audit/mutations/useCreatePolicy";
import useDeletePolicy from "@/services/audit/mutations/useDeletePolicy";
import PolicyDialogForm from "./PolicyDialogForm";
import { AssignProvidersDialog } from "./AssignProvidersDialog";
import useAssignProviderPolicy from "@/services/audit/mutations/useAssignProviderPolicy";
import useUnassignProviderPolicy from "@/services/audit/mutations/useUnassignProviderPolicy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useEditPolicy, { EditPolicyVariables } from "@/services/audit/mutations/useEditPolicy";
import { AUDIT_QUERY_STALE_TIME } from "@/components/audit/Audit.constants";

interface PolicyTableMeta {
  renderRowActions?: (row: PolicyTableData) => React.ReactNode;
}

export default function AuditPolicyDataTable({ tenantID, listenerID }: { tenantID: string; listenerID: string }) {
  const columnHelper = createColumnHelper<PolicyTableData>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('executeOn', {
      header: 'Execute On',
      cell: info => info.getValue()?.join(" / ") || ""
    }),
    columnHelper.accessor('providers', {
      header: 'Providers Assigned',
      cell: info => (
        <div className="flex items-center gap-2">
          <span>{info.getValue()?.amount || 0}</span>
          {(!info.getValue()?.amount) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <LucideAlertCircle className="h-4 w-4 text-orange-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>You must assign a provider for this policy to take effect</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as PolicyTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ], [columnHelper]);

  function isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }

  const policyTableMeta: PolicyTableMeta = {
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
                setSelectedPolicyId(row.policyID);
                setPolicyForm({ name: row.name, engine: row.engine, executeOn: row.executeOn, sample: "", rule: isBase64(row.rule) ? atob(row.rule) : row.rule });
                setIsAddPolicyDialogOpen(true);
              }}
            >
              <LucideEdit className="mr-2" />
              Edit Policy
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectedPolicyId(row.policyID);
                setSelectedProviders(row.providers.items.map(p => p.providerID));
                setIsAssignProvidersDialogOpen(true);
              }}
            >
              <LucideUsers className="mr-2" />
              Assign Providers
            </DropdownMenuItem>
            <FeatureItemDeleteAction
              featureType={"Audit Policy"}
              featureID={row.policyID}
              featureName={row.name}
              onDelete={() => { performDelete(row.policyID) }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete Policy
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  };

  const [isAddPolicyDialogOpen, setIsAddPolicyDialogOpen] = useState(false);
  const defaultFormValues = {
    name: "",
    engine: "rego",
    executeOn: [],
    sample: "",
    rule: "",
  };
  const [policyForm, setPolicyForm] = useState<PolicyForm>(defaultFormValues);
  const [isAssignProvidersDialogOpen, setIsAssignProvidersDialogOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const {
    data: policiesData,
    refetch: policiesRefetch,
    isLoading: isLoadingPolicies,
    isError: isErrorPolicies,
    isRefetchError: isRefetchErrorPolicies,
    error: policiesError
  } = useGetPolicies(false, tenantID, {
    staleTime: AUDIT_QUERY_STALE_TIME,
  });

  const {
    data: providersData,
    isLoading: isLoadingProviders,
  } = useGetAuditProviders(false, listenerID || '', {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: !!listenerID
  });

  const policies = useMemo(() => {
    if (!policiesData) return []

    // Transform the API response to include the required id dataProvider field
    return policiesData.map(policy => ({
      ...policy,
      id: policy.policyID,
    }));
  }, [policiesData]);

  const { mutate: createPolicy } = useCreatePolicy(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create Policy"),
    onSuccess: () => {
      policiesRefetch();
      toast.success("Policy created successfully")
    },
  });

  const { mutate: editPolicy } = useEditPolicy(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to edit Policy"),
    onSuccess: () => {
      policiesRefetch();
      toast.success("Policy edited successfully")
    },
  });

  const { mutate: deletePolicy } = useDeletePolicy(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete Policy"),
    onSuccess: () => {
      policiesRefetch();
      toast.success("Policy deleted successfully")
    },
  });

  const { mutateAsync: assignProvider } = useAssignProviderPolicy(false, {
    onError: (error) => handleDefaultApiHttpError(error, "Failed to assign provider"),
  });

  const { mutateAsync: unassignProvider } = useUnassignProviderPolicy(false, {
    onError: (error) => handleDefaultApiHttpError(error, "Failed to unassign provider"),
  });

  const performCreate = (payload: CreatePolicyPayload) => {
    payload.tenantID = tenantID;
    createPolicy(payload)
  };

  const performEdit = (editPayload: EditPolicyVariables) => {
    editPolicy(editPayload);
  };

  const performDelete = (policyID: string) => {
    deletePolicy({ id: policyID });
  };

  const handleSubmit = (payload: CreatePolicyPayload) => {
    if (selectedPolicyId) {
      const { name, executeOn, engine, rule } = { ...payload };
      const editPayload = { policyID: selectedPolicyId, payload: { name, executeOn, engine, rule } };
      performEdit(editPayload);
    } else {
      performCreate(payload);
    }
    handleAddPolicyDialogOpenChange(false);
  }

  const handleAssignProviders = async (providerIds: string[]) => {
    const currentPolicy = policies.find(p => p.id === selectedPolicyId);
    if (!currentPolicy) return;

    const currentProviderIds = currentPolicy.providers.items.map(p => p.providerID);

    const providersToUnassign = currentProviderIds.filter(
      providerId => !providerIds.includes(providerId)
    );

    const providersToAssign = providerIds.filter(
      providerId => !currentProviderIds.includes(providerId)
    );

    try {
      // Basically run all assign and unassign mutations in parallel and wait for them to finish
      const mutations = [
        ...providersToUnassign.map(providerId =>
          unassignProvider({ providerId, policyId: selectedPolicyId })
        ),
        ...providersToAssign.map(providerId =>
          assignProvider({ providerId, policyId: selectedPolicyId })
        )
      ];
      await Promise.all(mutations);
      await policiesRefetch();
      setIsAssignProvidersDialogOpen(false);

      // Only show success message if we had changes to make
      if (providersToAssign.length > 0 || providersToUnassign.length > 0) {
        const messages: string[] = [];
        if (providersToAssign.length > 0) {
          messages.push(`${providersToAssign.length} provider${providersToAssign.length !== 1 ? 's' : ''} assigned`);
        }
        if (providersToUnassign.length > 0) {
          messages.push(`${providersToUnassign.length} provider${providersToUnassign.length !== 1 ? 's' : ''} unassigned`);
        }
        toast.success(messages.join(' and '));
      }
    } catch (error) {
      handleDefaultApiHttpError(error as AxiosError<ApiHttpError>, "Failed to update provider assignments");
    }
  };

  useEffect(() => {
    if (!(policiesError || isRefetchErrorPolicies)) return;
    handleDefaultApiHttpError(policiesError, "Error while fetching listener Audit data");
  }, [policiesError, isErrorPolicies, isRefetchErrorPolicies]);

  const handleAddPolicyDialogOpenChange = (isOpen: boolean) => {
    setIsAddPolicyDialogOpen(isOpen);
    setPolicyForm(defaultFormValues);
    setSelectedPolicyId("");
  };

  const handleAssignProvidersOpenChange = (isOpen: boolean) => {
    setIsAssignProvidersDialogOpen(isOpen);
    setSelectedPolicyId("");
    setSelectedProviders([]);
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">Policies</h2>
        <Dialog open={isAddPolicyDialogOpen} onOpenChange={handleAddPolicyDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LucidePlus />
              Add Policy
            </Button>
          </DialogTrigger>
          <PolicyDialogForm
            selectedPolicyId={selectedPolicyId}
            policyForm={policyForm}
            onSubmit={handleSubmit}
            onCancel={() => { handleAddPolicyDialogOpenChange(false) }}
          />
        </Dialog>
      </div>

      <DataProvider
        data={policies}
        columns={columns}
        initialSort={{ id: 'name', desc: false }}
        isLoading={isLoadingPolicies}
      >
        <DataTable
          meta={policyTableMeta}
        />
      </DataProvider>

      <Dialog
        open={isAssignProvidersDialogOpen}
        onOpenChange={handleAssignProvidersOpenChange}
      >
        <AssignProvidersDialog
          currentAssignedProviders={selectedProviders || []}
          providers={providersData || []}
          isLoadingProviders={isLoadingProviders}
          onAssign={handleAssignProviders}
          onCancel={() => handleAssignProvidersOpenChange(false)}
        />
      </Dialog>
    </>
  )
}