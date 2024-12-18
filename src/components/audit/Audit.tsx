import { trackListenerInstallDialogOpened } from "@/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { API_DOMAIN, ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import useCreateAuditInstallationToken from "@/services/audit/mutations/useCreateAuditInstallationToken";
import useGetAuditProcessFile from "@/services/audit/queries/useGetAuditProcessFile";
import useGetListener from "@/services/audit/queries/useGetListener";
import useGetListenerAuditData from "@/services/audit/queries/useGetListenerAuditData";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError } from "@/types";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { createColumnHelper } from "@tanstack/react-table";
import { AxiosError } from "axios";
import { LucideAlertCircle, LucideFilter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { DataProvider, DataTable } from "../ui/DataProvider";
import { LISTENER_STATUS, TIME_RANGES } from "./Audit.constants";
import { AuditTableData, FilterSchema, Listener, ListenerStatus, TimeRange, filterSchema } from "./Audit.interfaces";
import AuditChartProblems from "./AuditChartProblems";
import AuditChartProviders from "./AuditChartProviders";
import AuditProviderDataTable from "./AuditProviderDataTable";
import AuditTimelineProblems from "./AuditTimelineProblems";
import AuditTimelineProviders from "./AuditTimelineProviders";
import FilterDialogForm from "./FilterDialogForm";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
import AuditPolicyDataTable from "./AuditPolicyDataTable";

const toYYYYMMDD = (date: Date) => {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
};

const getDaysBetweenDates = (start: string, end: string) => {
  const ONE_DAY_IN_MILLISECONDS = ONE_SECOND_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 60 * 24;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / ONE_DAY_IN_MILLISECONDS);
};

const isDateFromToday = (dateStr: string) => {
  const today = toYYYYMMDD(new Date());
  const date = toYYYYMMDD(new Date(dateStr));
  return today === date;
};

const getTimeRangeFromDays = (days: number | null): TimeRange => {
  const range = TIME_RANGES.find(r => r.days === days);
  if (!range) return null;
  return range.label;
};

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
  const [currentToggledTimeRange, setCurrentToggledTimeRange] = useState<number | null>(() => {
    const startDate = searchParams.get('chartsStartDate');
    const endDate = searchParams.get('chartsEndDate');
    if (!startDate || !endDate) return 0;

    /**
     * Our predefined time ranges are all from the *last* N days, so we gotta
     * measure backwards from *today*. Right now, if any custom date outside the
     * toggleable range is set, we allow it, but the toggle-group should become
     * unset (null).
     */
    if (!isDateFromToday(endDate)) return null;

    const diffDays = getDaysBetweenDates(startDate, endDate);
    // Only return a value if it matches one of our predefined ranges
    return TIME_RANGES.find(r => r.days === diffDays)?.days ?? null;
  });

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
    setSearchParams(prevParams => {
      // First, remove all existing filter parameters specifically to avoid stale values
      filterSchema.keyof().options.forEach(key => prevParams.delete(key));

      // Then add new filter values if they exist
      for (const [key, value] of Object.entries(selectedFilters)) {
        if (!value) continue; // Skip unset values

        if (Array.isArray(value)) {
          // For array values (like providers), set each value as a separate entry
          // TODO: Consider if we should use a single key with delimiters for each value instead
          if (value.length) {
            value.forEach(value => prevParams.append(key, value));
          }
        } else {
          // For single values, just set them directly
          prevParams.set(key, value);
        }
      }

      return prevParams;
    });

    handleFiltersDialogOpenChange(false);
    listenerAuditRefetch();
  };

  useEffect(() => {
    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(listener.id);
    }
  }, [isListenerInstallDialogOpen, listener.id]);

  const handleTimeRangeChange = (days: number | null) => {
    setCurrentToggledTimeRange(days);

    setSearchParams(prevParams => {
      if (!days) {
        prevParams.delete('chartsStartDate');
        prevParams.delete('chartsEndDate');
      } else {
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - days);

        prevParams.set('chartsStartDate', toYYYYMMDD(start));
        prevParams.set('chartsEndDate', toYYYYMMDD(end));
      }
      return prevParams;
    });
  };

  const chartsStartDate = searchParams.get('chartsStartDate');
  const chartsEndDate = searchParams.get('chartsEndDate');

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

      <div className="flex items-center justify-between pt-4">
        <h2 className="font-bold">Analytics</h2>
        <ToggleGroup
          variant="outline"
          type="single"
          value={String(currentToggledTimeRange)}
          onValueChange={(value) => handleTimeRangeChange(Number(value))}
        >
          {TIME_RANGES.map(({ days, label }) => (
            <ToggleGroupItem key={days} className="w-12" value={String(days)}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(416px,100%),1fr))] gap-4 mt-6">
        {currentToggledTimeRange === 0 ? (
          <>
            <AuditChartProviders />
            <AuditChartProblems />
          </>
        ) : (chartsStartDate && chartsEndDate) ? (
          <>
            <AuditTimelineProviders
              timeRange={getTimeRangeFromDays(currentToggledTimeRange)}
              startDate={chartsStartDate}
              endDate={chartsEndDate}
            />
            <AuditTimelineProblems
              timeRange={getTimeRangeFromDays(currentToggledTimeRange)}
              startDate={chartsStartDate}
              endDate={chartsEndDate}
            />
          </>
        ) : null}
      </div>

      <AuditPolicyDataTable
        tenantID={listener.tenant_id}
      />

      <AuditProviderDataTable
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
