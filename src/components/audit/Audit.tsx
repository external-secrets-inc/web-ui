import { trackListenerInstallDialogOpened } from "@/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  API_DOMAIN,
  ONE_MINUTE_IN_SECONDS,
  ONE_SECOND_IN_MILLISECONDS,
} from "@/constants";
import useCreateAuditListener from "@/services/audit/mutations/useCreateAuditListener";
import useCreateTenantInstallationToken from "@/services/audit/mutations/useCreateTenantInstallationToken";
import useCreateTenantListener from "@/services/audit/mutations/useCreateTenantListener";
import useGetAuditListener from "@/services/audit/queries/useGetAuditListener";
import useGetTenantBashFile from "@/services/audit/queries/useGetTenantBashFile";
import useGetTenantHelm from "@/services/audit/queries/useGetTenantHelm";
import useGetTenantListeners from "@/services/audit/queries/useGetTenantListeners";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError, IUserData } from "@/types";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AxiosError } from "axios";
import { LucideAlertCircle, LucideRefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { AUDIT_PAGE_QUERY_REFETCH_INTERVAL, AUDIT_QUERY_STALE_TIME, LISTENER_STATUS, TIME_RANGES } from "./Audit.constants";
import {
  AuditListener,
  CreateAuditListenerPayload,
  CreateTenantListenerPayload,
  ListenerStatus,
  TenantListener,
  TimeRange,
  TimeUnit,
} from "./Audit.interfaces";
import AuditChartProblems from "./AuditChartProblems";
import AuditChartProviders from "./AuditChartProviders";
import AuditPolicyDataTable from "./AuditPolicyDataTable";
import AuditProviderDataTable from "./AuditProviderDataTable";
import AuditTimelineProblems from "./AuditTimelineProblems";
import AuditTimelineProviders from "./AuditTimelineProviders";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
import { AuditSecretTable } from "./AuditSecretTable";
import { formatDate } from "@/utils/dateUtils";
import AppPageHeaderPortal from "@/components/AppPageHeaderPortal";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { Loader } from "@/components/ui/Loader";

const getDaysBetweenDates = (start: string, end: string) => {
  const ONE_DAY_IN_MILLISECONDS =
    ONE_SECOND_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 60 * 24;
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) /
    ONE_DAY_IN_MILLISECONDS
  );
};

const isDateFromToday = (dateStr: string) => {
  const today = formatDate(new Date(), { format: 'isoUTC' });
  const date = formatDate(new Date(dateStr), { format: 'isoUTC' });
  return today === date;
};

const getTimeRangeFromDays = (days: number | null): TimeRange => {
  const range = TIME_RANGES.find((r) => r.days === days);
  if (!range) return null;
  return range.label;
};

const RefreshDataButton = () => {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      // Every Audit query has this as "root" query-key, so by invalidating it, we
      // effectively invalidate all Audit queries and automatically refetch them
      queryKey: ['audit'],
      refetchType: 'active',
    });
  };
  const isFetchingAuditData = useIsFetching({ queryKey: ['audit'] }) > 0;


  return (
    <Button
      variant="secondary"
      onClick={handleRefresh}
      disabled={isFetchingAuditData}
    >
      {isFetchingAuditData ? (
        <Loader />
      ) : (
        <LucideRefreshCw />
      )}
      Refresh Data
    </Button>
  );
};

export default function Audit() {
  const [bashCommand, setBashCommand] = useState("");
  const [manifestCommand, setManifestCommand] = useState("");
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isTenantListenerCreated, setIsTenantListenerCreated] = useState(false);
  const [createTenantListenerError, setCreateTenantListenerError] = useState<AxiosError<ApiHttpError> | null>(null);
  const [isAuditListenerCreated, setIsAuditListenerCreated] = useState(false);
  const [createAuditListenerError, setCreateAuditListenerError] = useState<AxiosError<ApiHttpError> | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(() => {
    const initialTimeUnit = searchParams.get("chartsTimeUnit")
    if (!initialTimeUnit) return "day";
    return initialTimeUnit as TimeUnit;
  })
  const [currentToggledTimeRange, setCurrentToggledTimeRange] = useState<number | null>(() => {
    const startDate = searchParams.get("chartsStartDate");
    const endDate = searchParams.get("chartsEndDate");
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
    return TIME_RANGES.find((r) => r.days === diffDays)?.days ?? null;
  });

  // TODO remove mock https://github.com/external-secrets-inc/web-ui/issues/115
  const { data: tenantListenersData } = useGetTenantListeners(false, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    refetchInterval: AUDIT_PAGE_QUERY_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    retry: false,
  });

  const defaultTenantListenerPayload = useMemo((): CreateTenantListenerPayload => ({
    name: "default-listener",
    tags: { additionalProp1: "v0" }, // TODO: are these tags necessary now?
  }), []);

  const { mutate: createTenantListener } = useCreateTenantListener(false, {
    onSuccess: () => {
      setIsTenantListenerCreated(true);
      setCreateTenantListenerError(null);
    },
    onError: (error: AxiosError<ApiHttpError>) => {
      handleDefaultApiHttpError(error, "Error while creating tenant listener");
      setIsTenantListenerCreated(false);
      setCreateTenantListenerError(error);
    },
  });

  // Ensure tenant listener is created before proceeding
  useEffect(() => {
    if (tenantListenersData && tenantListenersData.length === 0) {
      createTenantListener(defaultTenantListenerPayload);
    } else {
      setIsTenantListenerCreated(true);
      setCreateTenantListenerError(null);
    }
  }, [tenantListenersData, createTenantListener, defaultTenantListenerPayload]);

  const tenantListener = useMemo((): TenantListener => {
    if (!tenantListenersData || tenantListenersData.length === 0)
      return {
        id: "",
        name: "",
        enabled: false,
        tags: {},
      };

    return {
      id: tenantListenersData[0].id,
      name: tenantListenersData[0].name,
      enabled: tenantListenersData[0].enabled,
      tags: tenantListenersData[0].tags,
    };
  }, [tenantListenersData]);

  const {
    data: auditListenerData,
    isError: isErrorAuditListener,
    isLoading: isLoadingAuditListener,
    isSuccess: isSuccessAuditListener,
    error: fetchAuditListenerError,
  } = useGetAuditListener(false, tenantListener.id, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    refetchInterval: AUDIT_PAGE_QUERY_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
    enabled: Boolean(tenantListener.id), // Only fetch when tenant listener exists
    retry: false,
  });

  const auditListener = useMemo((): AuditListener => {
    if (isLoadingAuditListener || !auditListenerData)
      return {
        listenerID: "",
        tenantID: "",
        status: LISTENER_STATUS.PENDING_INSTALLATION,
      };

    return {
      listenerID: auditListenerData.listenerID,
      tenantID: auditListenerData.tenantID,
      status: auditListenerData.status.toUpperCase() as ListenerStatus,
    };
  }, [auditListenerData, isLoadingAuditListener]);


  useEffect(() => {
    if (!fetchAuditListenerError) return;

    handleDefaultApiHttpError(fetchAuditListenerError, "Error while fetching audit listener");
  }, [fetchAuditListenerError, isErrorAuditListener]);

  // TODO: make a post request to create a listener on audit-poc-api
  const authUser = useAuthUser<IUserData>();

  const defaultAuditListenerPayload = useMemo((): CreateAuditListenerPayload => ({
    listenerID: tenantListener.id,
    tenantID: authUser?.tenantId ?? "",
  }), [tenantListener.id, authUser?.tenantId]);

  // Setup mutation with success/error handlers
  const { mutate: createAuditListener } = useCreateAuditListener(false, {
    onSuccess: () => {
      setIsAuditListenerCreated(true);
      setCreateAuditListenerError(null);
    },
    onError: (error: AxiosError<ApiHttpError>) => {
      handleDefaultApiHttpError(error, "Error while creating audit listener");
      setCreateAuditListenerError(error);
    },
  });

  // Effect to handle audit listener creation
  useEffect(() => {
    if (!tenantListener.id) return;

    if (!isSuccessAuditListener && fetchAuditListenerError?.status != 404) return;

    if (!auditListener.listenerID) {
      createAuditListener(defaultAuditListenerPayload);
    } else {
      setIsAuditListenerCreated(true);
      setCreateAuditListenerError(null);
    }
  }, [tenantListener.id, auditListener.listenerID, createAuditListener, defaultAuditListenerPayload, isSuccessAuditListener, tenantListenersData, fetchAuditListenerError]);

  const { mutate: createTenantInstallationToken, data: tenantInstallationToken } = useCreateTenantInstallationToken(
    false,
    {
      onError: (error: AxiosError<ApiHttpError>) =>
        handleDefaultApiHttpError(
          error,
          "Error while trying to generate manifest token"
        ),
    }
  );

  const {
    data: tenantBashFileData,
    isLoading: isLoadingTenantBashFile,
    error: tenantBashFileError,
    isError: isErrorTenantBashFile,
  } = useGetTenantBashFile(false, tenantInstallationToken ?? "", "latest", tenantListener.id, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: isListenerInstallDialogOpen && Boolean(tenantInstallationToken && tenantListener.id) // Only fetch when dialog is open with token and listener ID
  });

  const {
    data: tenantHelmData,
    isLoading: isLoadingTenantHelm,
    error: tenantHelmError,
    isError: isErrorTenantHelm,
  } = useGetTenantHelm(false, "latest", tenantListener.id, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: isListenerInstallDialogOpen && Boolean(tenantListener.id) // Only fetch when dialog is open with listener ID
  });


  useEffect(() => {
    if (!tenantBashFileError) return;

    handleDefaultApiHttpError(
      tenantBashFileError,
      "Error while fetching tenant bash file"
    );
  }, [tenantBashFileError, isErrorTenantBashFile]);

  useEffect(() => {
    if (!tenantHelmError) return;

    handleDefaultApiHttpError(
      tenantHelmError,
      "Error while fetching Helm chart"
    );
  }, [tenantHelmError, isErrorTenantHelm]);

  useEffect(() => {
    if (!isTenantListenerCreated) return;

    if (tenantListener.id) {
      createTenantInstallationToken({ id: tenantListener.id });
    }
  }, [tenantListener.id, createTenantInstallationToken, isTenantListenerCreated]);

  // TODO update commands to real endpoints https://github.com/external-secrets-inc/web-ui/issues/118
  useEffect(() => {
    if (!tenantInstallationToken) return;

    let command = [
      "curl \\",
      `${API_DOMAIN}/public/listeners/${tenantListener.id}/manifest/latest\\`,
      `?token=${tenantInstallationToken} \\`,
      "| kubectl apply -f -",
    ].join("\n");
    setManifestCommand(command);

    command = [
      "curl \\",
      `${API_DOMAIN}/public/listeners/${tenantListener.id}/bash/latest\\`,
      `?token=${tenantInstallationToken} \\`,
      "| bash",
    ].join("\n");
    setBashCommand(command);

  }, [tenantInstallationToken, tenantListener.id]);

  const handleListenerInstallDialogOpenChange = (isOpen: boolean) => {
    setIsListenerInstallDialogOpen(isOpen);
  };

  useEffect(() => {
    if (!isTenantListenerCreated) return;

    if (isListenerInstallDialogOpen) {
      trackListenerInstallDialogOpened(auditListener.listenerID);
    }
  }, [isListenerInstallDialogOpen, auditListener.listenerID, isTenantListenerCreated]);

  const calculateTimeUnit = (days: number | null) => {
    if (!days) return "day";
    if (days <= 7) return "hour"
    if (days <= 30) return "day"
    if (days <= 90) return "week"

    return "month"
  }

  const handleTimeRangeChange = (days: number | null) => {
    setCurrentToggledTimeRange(days);
    const chartsTimeUnit = calculateTimeUnit(days);
    setTimeUnit(chartsTimeUnit);

    setSearchParams((prevParams) => {
      if (!days) {
        prevParams.delete("chartsStartDate");
        prevParams.delete("chartsEndDate");
        prevParams.delete("chartsTimeUnit");
      } else {
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - days);

        prevParams.set("chartsStartDate", formatDate(start, { format: 'isoDateOnlyUTC' }));
        prevParams.set("chartsEndDate", formatDate(end, { format: 'isoDateOnlyUTC' }));
        prevParams.set("chartsTimeUnit", chartsTimeUnit);
      }
      return prevParams;
    });
  };

  const chartsStartDate = searchParams.get("chartsStartDate");
  const chartsEndDate = searchParams.get("chartsEndDate");

  const getTenantBashFileContent = () => {
    if (tenantBashFileError) return "Failed to load bash file.";
    return tenantBashFileData?.bash || "";
  };

  const getTenantHelmContent = () => {
    if (tenantHelmError) return "Failed to load Helm chart.";
    return tenantHelmData?.manifest || "";
  };

  return (
    <div className="space-y-4">
      <AppPageHeaderPortal>
        <RefreshDataButton />
      </AppPageHeaderPortal>

      {createTenantListenerError && (
        <Alert
          className="flex gap-2 items-center justify-between flex-wrap"
          variant="destructive"
        >
          <div>
            <AlertTitle className="flex gap-3 items-center">
              <LucideAlertCircle className="text-destructive" /> Failed to create or fetch tenant listener
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Retry in order to make it available for installation, or contact support if the issue persists
            </AlertDescription>
          </div>
          <Button variant="outline" onClick={() => createTenantListener(defaultTenantListenerPayload)}>Retry</Button>
        </Alert>
      )}

      {createAuditListenerError && (
        <Alert
          className="flex gap-2 items-center justify-between flex-wrap"
          variant="destructive"
        >
          <div>
            <AlertTitle className="flex gap-3 items-center">
              <LucideAlertCircle className="text-destructive" /> Failed to create or fetch audit listener
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Retry in order to make it available for installation, or contact support if the issue persists
            </AlertDescription>
          </div>
          <Button variant="outline" onClick={() => createAuditListener(defaultAuditListenerPayload)}>Retry</Button>
        </Alert>
      )}

      {isTenantListenerCreated && isAuditListenerCreated && !isLoadingAuditListener &&
        auditListener.status === LISTENER_STATUS.PENDING_INSTALLATION && (
          <Alert
            className="flex gap-2 items-center justify-between flex-wrap"
            variant="warning"
          >
            <div>
              <AlertTitle className="flex gap-3 items-center">
                <LucideAlertCircle className="text-orange-500" /> Listener not
                installed
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                To start receiving audit data, you need to install our listener
                in your cluster
              </AlertDescription>
            </div>
            <Dialog
              open={isListenerInstallDialogOpen}
              onOpenChange={handleListenerInstallDialogOpenChange}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Install listener</Button>
              </DialogTrigger>
              <ListenerInstallDialogContent
                id={auditListener.listenerID}
                bashFileContent={getTenantBashFileContent()}
                helmContent={getTenantHelmContent()}
                isLoadingBashFile={isLoadingTenantBashFile}
                isLoadingHelm={isLoadingTenantHelm}
                bashCommand={bashCommand}
                manifestCommand={manifestCommand}
              />
            </Dialog>
          </Alert>
        )}

      {isTenantListenerCreated && isAuditListenerCreated && !isLoadingAuditListener && auditListener.status === LISTENER_STATUS.OFFLINE && (
        <Alert
          className="flex gap-2 items-center justify-between flex-wrap"
          variant="destructive"
        >
          <AlertTitle className="flex gap-2 items-center">
            <LucideAlertCircle className="text-destructive" /> Listener Offline
            or Unreachable
          </AlertTitle>
          <AlertDescription>
            The listener is currently offline or cannot be accessed. Please
            check the cluster configuration on your end.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Analytics</h2>
        </div>
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
            <AuditChartProviders listenerID={tenantListener.id} />
            <AuditChartProblems listenerID={tenantListener.id} />
          </>
        ) : chartsStartDate && chartsEndDate ? (
          <>
            <AuditTimelineProviders
              listenerID={tenantListener.id}
              timeRange={getTimeRangeFromDays(currentToggledTimeRange)}
              startDate={chartsStartDate}
              endDate={chartsEndDate}
              timeUnit={timeUnit}
            />
            <AuditTimelineProblems
              listenerID={tenantListener.id}
              timeRange={getTimeRangeFromDays(currentToggledTimeRange)}
              startDate={chartsStartDate}
              endDate={chartsEndDate}
              timeUnit={timeUnit}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AuditPolicyDataTable
          tenantID={authUser?.tenantId ?? ""}
          listenerID={auditListener.listenerID}
        />
        <AuditProviderDataTable
          tenantID={auditListener.tenantID}
          listenerID={auditListener.listenerID}
        />
        <AuditSecretTable
          listenerID={auditListener.listenerID}
        />
      </div>
    </div>
  );
}
