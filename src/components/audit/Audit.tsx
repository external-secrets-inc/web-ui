import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { API_DOMAIN, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateAuditInstallationToken from "@/services/audit/mutations/useCreateAuditInstallationToken";
import useGetAuditProcessFile from "@/services/audit/queries/useGetAuditProcessFile";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
import useGetListener from "@/services/audit/queries/useGetListener";
import AuditChartProblems from "./AuditChartProblems";
import AuditChartProviders from "./AuditChartProviders";
import useGetListenerAuditData from "@/services/audit/queries/useGetListenerAuditData";
import { trackListenerInstallDialogOpened } from "@/analytics";
import { AuditTableData, FilterSchema, Listener, ListenerStatus } from "./Audit.interfaces";
import { DataProvider, DataTable } from "../ui/DataProvider";
import { useSearchParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideAlertCircle, LucideFilter } from "lucide-react";
import { LISTENER_STATUS } from "./Audit.constants";
import FilterDialogForm from "./FilterDialogForm";
import AuditProvider from "./AuditProvider";

export default function Audit() {
  const columnHelper = createColumnHelper<AuditTableData>()

  const columns = useMemo(() => [
    columnHelper.accessor('secret', {
      header: 'Secret',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('provider', {
      header: 'Provider',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('lastRotation', {
      header: 'Last Rotation',
      cell: info => <span className="font-mono">{new Date(info.getValue()).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
    }),
    columnHelper.accessor('lastAccess', {
      header: 'Last Access',
      cell: info => <span className="font-mono">{new Date(info.getValue()).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
    }),
    columnHelper.accessor('duplicatesAmount', {
      header: 'Duplicates',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('accessorsAmount', {
      header: 'Accessors',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('policiesAmount', {
      header: 'Policy compliance',
      cell: info => {
        return (
          <div className="flex gap-2 w-full items-center justify-between">
            {info.getValue()} {!info.row.original.fullCompliant && <LucideAlertCircle className="text-orange-500" />}
          </div>
        )
      }
    })
  ], [columnHelper])

  const [processCommand, setProcessCommand] = useState("")
  const [applyCommand, setApplyCommand] = useState("")
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(() => {
    return {
      provider: searchParams.getAll('provider'),
      policy: searchParams.get('policy') ?? undefined,
      secretName: searchParams.get('secretName') ?? undefined,
      policyStatus: searchParams.get('policyStatus') ?? undefined,
      duplicates: searchParams.get('duplicates') ?? undefined,
      lastAccess: searchParams.get('lastAccess') ?? undefined,
      lastRotation: searchParams.get('lastRotation') ?? undefined,
      accessors: searchParams.get('accessors') ?? undefined,
    } as FilterSchema
  }, [searchParams])

  // TODO remove mock https://github.com/external-secrets-inc/web-ui/issues/115
  const { data: listenerData, isError: isErrorListener, isLoading: isLoadingListener, error: listenerError } = useGetListener(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listener = useMemo((): Listener => {
    if (isLoadingListener || !listenerData) return {
      id: "",
      tenant_id: "",
      status: LISTENER_STATUS.PENDING_INSTALLATION
    }

    return {
      id: listenerData.id,
      tenant_id: listenerData.tenant_id,
      status: listenerData.status as ListenerStatus
    }
  }, [listenerData, isLoadingListener]);

  useEffect(() => {
    if (!listenerError) return;

    handleDefaultApiHttpError(listenerError, "Error while fetching listener");
  }, [listenerError, isErrorListener]);

  const { data: listenerAuditData, refetch: listenerAuditRefetch, isLoading: isLoadingListenerAudit, isError: isErrorListenerAudit, isRefetchError: isRefetchErrorListenerAudit, error: listenerAuditError } = useGetListenerAuditData(true, {
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  const listenerAudit = useMemo(() => {
    if (!listenerAuditData) return {
      secretData: [],
      secretsNames: [],
      policiesNames: [],
      providers: [],
    }

    return listenerAuditData;
  }, [listenerAuditData]);

  useEffect(() => {
    if (!(listenerAuditError || isRefetchErrorListenerAudit)) return;

    handleDefaultApiHttpError(listenerAuditError, "Error while fetching listener Audit data")
  }, [listenerAuditError, isErrorListenerAudit, isRefetchErrorListenerAudit])

  const { mutate: createToken, data: token } = useCreateAuditInstallationToken(true, {
    onError: (error: AxiosError<ApiHttpError>) =>
      handleDefaultApiHttpError(
        error,
        "Error while trying to generate manifest token"
      ),
  });

  const {
    data: processFileData,
    error: processFileError,
    isError: isErrorProcessFile,
  } = useGetAuditProcessFile(true, token ?? "", "latest", {
    enabled: token !== "",
  });

  useEffect(() => {
    if (!processFileError) return;

    handleDefaultApiHttpError(
      processFileError,
      "Error while fetching process file"
    );
  }, [processFileError, isErrorProcessFile]);

  useEffect(() => {
    createToken();
  }, [createToken]);

  // TODO update commands to real endpoints https://github.com/external-secrets-inc/web-ui/issues/118
  useEffect(() => {
    if (!token) return;

    let command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/manifest/latest\\`,
      `?token=${token} \\`,
      "| kubectl apply -f -",
    ].join("\n");
    setApplyCommand(command);

    command = [
      "curl \\",
      `${API_DOMAIN}/public/audit/process/latest\\`,
      `?token=${token} \\`,
      "| sh process.sh",
    ].join("\n");
    setProcessCommand(command);
  }, [token]);

  const handleListenerInstallDialogOpenChange = (isOpen: boolean) => {
    setIsListenerInstallDialogOpen(isOpen);
  };

  const handleFiltersDialogOpenChange = (isOpen: boolean) => {
    setIsFiltersDialogOpen(isOpen);
  };

  const handleFilterChange = (selectedFilters: FilterSchema) => {
    const filteredFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          (!Array.isArray(value) || value.length > 0)
      )
    );
    setSearchParams(() => {
      const newSearchParams: Record<string, string | string[]> = {};
      Object.entries(filteredFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          newSearchParams[key] = value;
        } else if (value !== null && value !== undefined && value !== "") {
          newSearchParams[key] = String(value);
        }
      });

      return newSearchParams;
    });
    handleFiltersDialogOpenChange(false);

    listenerAuditRefetch();
  };

  useEffect(() => {
    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(listener.id);
    }
  }, [isListenerInstallDialogOpen, listener.id]);

  return (
    <div className="space-y-4">
      {!isLoadingListener && listener.status === LISTENER_STATUS.PENDING_INSTALLATION && (
        <Alert
          className="flex gap-2 items-center justify-between flex-wrap"
          variant="warning"
        >
          <div>
            <AlertTitle className="flex gap-3 items-center">
              <LucideAlertCircle className="text-orange-500" /> Listener not installed
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              To start receiving audit data, you need to install our listener in your cluster
            </AlertDescription>
          </div>
          <Dialog open={isListenerInstallDialogOpen} onOpenChange={handleListenerInstallDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Install listener
              </Button>
            </DialogTrigger>
            <ListenerInstallDialogContent
              id={listener.id}
              processFile={processFileData ? processFileData.process : ''}
              processCommand={processCommand}
              applyCommand={applyCommand}
            />
          </Dialog>
        </Alert>
      )}

      {!isLoadingListener && listener.status === LISTENER_STATUS.OFFLINE && (
        <Alert
          className="flex gap-2 items-center justify-between flex-wrap"
          variant="destructive"
        >
          <AlertTitle className="flex gap-2 items-center">
            <LucideAlertCircle className="text-destructive" /> Listener Offline or Unreachable
          </AlertTitle>
          <AlertDescription>
            The listener is currently offline or cannot be accessed. Please check the cluster configuration on your end.
          </AlertDescription>
        </Alert>
      )}

      <h2 className="font-bold pt-4">Analytics</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(416px,100%),1fr))] gap-4 mt-6">
        <AuditChartProviders />
        <AuditChartProblems />
      </div>

      <AuditProvider
        tenantID={listener.tenant_id}
        listenerID={listener.id}
      />

      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">All Secrets</h2>
        <Dialog open={isFiltersDialogOpen} onOpenChange={handleFiltersDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="self-center min-[260px]:self-end"
              aria-label="Filters"
              title="Filters"
            >
              <LucideFilter />
            </Button>
          </DialogTrigger>
          <FilterDialogForm
            initialValues={initialFilters}
            onSubmit={(data) => {
              handleFilterChange(data);
              handleFiltersDialogOpenChange(false);
            }}
            secretsNames={listenerAudit.secretsNames}
            policiesNames={listenerAudit.policiesNames}
            providers={listenerAudit.providers}
          />
        </Dialog>
      </div>

      <DataProvider
        data={listenerAudit.secretData}
        columns={columns}
        initialSort={{ id: 'lastRotation', desc: true }}
        isLoading={isLoadingListenerAudit}
      >
        <DataTable />
      </DataProvider>
    </div>
  );
}
