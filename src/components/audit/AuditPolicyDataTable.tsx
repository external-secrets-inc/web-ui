import { useEffect, useMemo, useState } from "react";
import { CreatePolicyPayload, PolicyTableData } from "./Audit.interfaces";
import { createColumnHelper } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { LucideMoreVertical, LucidePlus, LucideTrash2 } from "lucide-react";
import { FeatureItemDeleteAction } from "../FeatureCollection";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { DataProvider, DataTable } from "../ui/DataProvider";
import useGetPolicies from "@/services/audit/queries/useGetPolicies";
import useCreatePolicy from "@/services/audit/mutations/useCreatePolicy";
import useDeletePolicy from "@/services/audit/mutations/useDeletePolicy";
import AddPolicyDialogForm from "./AddPolicyDialogForm";

interface PolicyTableMeta {
  renderRowActions?: (row: PolicyTableData) => React.ReactNode;
}

export default function AuditPolicyDataTable({ tenantID }: { tenantID: string }) {
  const columnHelper = createColumnHelper<PolicyTableData>();

  // Adjust PolicyTableData Later
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
      header: 'Providers',
      cell: info => info.getValue()?.length || 0
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as PolicyTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ], [columnHelper])

  // Include EditPolicy/AssignProvider Buttons
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
            <FeatureItemDeleteAction
              featureType={"Audit Policy"}
              featureID={row.id}
              featureName={row.name}
              onDelete={() => { performDelete(row.id) }}
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

  const {
    data: policiesData,
    refetch: policiesRefetch,
    isLoading: isLoadingPolicies,
    isError: isErrorPolicies,
    isRefetchError: isRefetchErrorPolicies,
    error: policiesError
  } = useGetPolicies(true, tenantID, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const policies = useMemo(() => {
    if (!policiesData) return []

    return policiesData;
  }, [policiesData]);

  const { mutate: createPolicy } = useCreatePolicy(true, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create Policy"),
    onSuccess: () => {
      policiesRefetch();
      toast.success("Policy created successfully")
    }
  });

  const { mutate: deletePolicy } = useDeletePolicy(true, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete Policy"),
    onSuccess: () => {
      policiesRefetch();
      toast.success("Policy deleted successfully")
    },
  })

  const performCreate = (payload: CreatePolicyPayload) => {
    payload.tenantID = tenantID;
    createPolicy(payload)
  }

  const performDelete = (policyID: string) => {
    deletePolicy({ id: policyID });
  }

  useEffect(() => {
    if (!(policiesError || isRefetchErrorPolicies)) return;

    handleDefaultApiHttpError(policiesError, "Error while fetching listener Audit data")
  }, [policiesError, isErrorPolicies, isRefetchErrorPolicies])

  const handleAddPolicyDialogOpenChange = (isOpen: boolean) => {
    setIsAddPolicyDialogOpen(isOpen);
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">Policies</h2>
        <Dialog open={isAddPolicyDialogOpen} onOpenChange={handleAddPolicyDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="self-center min-[260px]:self-end"
              aria-label="Add Policy"
              title="Add Policy"
            >
              <LucidePlus />
            </Button>
          </DialogTrigger>
          <AddPolicyDialogForm
            onSubmit={(payload: CreatePolicyPayload) => {
              performCreate(payload)
              handleAddPolicyDialogOpenChange(false)
            }}
            onCancel={() => { handleAddPolicyDialogOpenChange(false) }}
          />
        </Dialog>
      </div>

      <DataProvider
        data={policies}
        columns={columns}
        initialSort={{ id: 'lastRotation', desc: true }}
        isLoading={isLoadingPolicies}
      >
        <DataTable
          meta={policyTableMeta}
        />
      </DataProvider>
    </>
  )
}