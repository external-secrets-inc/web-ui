import { trackListenerInstallDialogOpened } from "@/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  API_DOMAIN,
  ONE_MINUTE_IN_SECONDS,
  ONE_SECOND_IN_MILLISECONDS,
} from "@/constants";
import useCreateTenantInstallationToken from "@/services/audit/mutations/useCreateTenantInstallationToken";
import useGetTenantBashFile from "@/services/audit/queries/useGetTenantBashFile";
import useGetTenantHelm from "@/services/audit/queries/useGetTenantHelm";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { ApiHttpError, IUserData } from "@/types";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AxiosError } from "axios";
import { LucideAlertCircle, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AUDIT_QUERY_STALE_TIME, LISTENER_STATUS, TIME_RANGES } from "./Audit.constants";
import { TimeRange, TimeUnit, TenantListener, AuditListener } from "./Audit.interfaces";
import AuditChartProblems from "./AuditChartProblems";
import AuditChartProviders from "./AuditChartProviders";
import AuditPolicyDataTable from "./AuditPolicyDataTable";
import AuditProviderDataTable from "./AuditProviderDataTable";
import AuditTimelineProblems from "./AuditTimelineProblems";
import AuditTimelineProviders from "./AuditTimelineProviders";
import ListenerInstallDialogContent from "./ListenerInstallDialogContent";
import { AuditSecretTable } from "./AuditSecretTable";
import { formatDate } from "@/utils/dateUtils";
import AuditDestinationDataTable from "./AuditDestinationDataTable";

interface AuditProps {
  tenantListener: TenantListener;
  auditListener: AuditListener;
}

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

const STATUS_CONFIG = {
  [LISTENER_STATUS.ACTIVE]: {
    label: "Active",
    variant: "success",
    color: "text-green-500"
  },
  [LISTENER_STATUS.OFFLINE]: {
    label: "Offline",
    variant: "destructive",
    color: "text-red-500"
  },
  [LISTENER_STATUS.PENDING_INSTALLATION]: {
    label: "Pending Installation",
    variant: "warning",
    color: "text-orange-500"
  }
} as const;

export default function Audit({ tenantListener, auditListener }: AuditProps) {
  const authUser = useAuthUser<IUserData>();
  const [bashCommand, setBashCommand] = useState("");
  const [manifestCommand, setManifestCommand] = useState("");
  const [isListenerInstallDialogOpen, setIsListenerInstallDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(() => {
    const initialTimeUnit = searchParams.get("chartsTimeUnit")
    if (!initialTimeUnit) return "day";
    return initialTimeUnit as TimeUnit;
  });
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
    enabled: isListenerInstallDialogOpen && Boolean(tenantInstallationToken)
  });

  const {
    data: tenantHelmData,
    isLoading: isLoadingTenantHelm,
    error: tenantHelmError,
    isError: isErrorTenantHelm,
  } = useGetTenantHelm(false, "latest", tenantListener.id, {
    staleTime: AUDIT_QUERY_STALE_TIME,
    enabled: isListenerInstallDialogOpen
  });

  // Effect to create installation token when dialog opens
  useEffect(() => {
    if (!isListenerInstallDialogOpen || !tenantListener.id) return;

    createTenantInstallationToken({ id: tenantListener.id });
  }, [isListenerInstallDialogOpen, tenantListener.id, createTenantInstallationToken]);

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

  // Update commands contents when token is available
  // TODO update commands to real endpoints https://github.com/external-secrets-inc/web-ui/issues/118
  useEffect(() => {
    if (!tenantInstallationToken || !tenantListener.id) return;

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
    if (!auditListener?.listenerID) return;

    trackListenerInstallDialogOpened(auditListener.listenerID);
  }, [auditListener?.listenerID]);

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

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] ?? {
    label: "Unknown",
    variant: "secondary",
    color: "text-gray-500"
  };

  return (
    <div className="space-y-8">
      {auditListener.status === LISTENER_STATUS.PENDING_INSTALLATION && (
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

      {auditListener.status === LISTENER_STATUS.OFFLINE && (
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

      <Tabs defaultValue="dashboard" className="w-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Listener Status:</span>
            <Badge
              variant={getStatusConfig(auditListener.status).variant}
              className="flex items-center gap-2"
            >
              <Circle
                className={`w-2 h-2 animate-pulse ${getStatusConfig(auditListener.status).color}`}
                fill="currentColor"
              />
              {getStatusConfig(auditListener.status).label}
            </Badge>
          </div>
        </div>

        <TabsContent value="dashboard" className="data-[state=active]:grid grid-cols-1 gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-4">
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

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(416px,100%),1fr))] gap-4">
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
          <AuditSecretTable
            listenerID={auditListener.listenerID}
          />
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <AuditProviderDataTable
            tenantID={auditListener.tenantID}
            listenerID={auditListener.listenerID}
          />
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <AuditPolicyDataTable
            tenantID={authUser?.tenantId ?? ""}
            listenerID={auditListener.listenerID}
          />
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <AuditDestinationDataTable/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
