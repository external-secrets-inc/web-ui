import { Status, StatusMap } from "../Common.interfaces";
import { StatusBadge } from "../StatusBadge";

const CONSUMER_STATUS_MAP: StatusMap = {
  LocationsUpToDate: {
    variant: "success",
    display: "UpToDate",
    message: "Locations and Consumers up to date",
  },
  WorkloadReady: {
    variant: "success",
    display: "UpToDate",
    message: "Locations and Consumers up to date",
  },
    ConsumerNotReady: {
    variant: "destructive",
    display: "WorkloadPendingUpdate",
    message: (s) => s.message ?? "Consumer is not ready",
  },
  LocationsOutOfDate: {
    variant: "destructive",
    display: "CredentialsMissingUpdate",
    message: (s) => s.message ?? "Locations are out of date",
  },
  WorkloadNotReady: {
    variant: "warning",
    display: "UpdateInProgress",
    message: (s) => s.message ?? "Workload is not ready",
  },
};

interface ConsumerStatusBadgeProps {
  statusData?: Status;
}
export function ConsumerStatusBadge({ statusData }: ConsumerStatusBadgeProps) {
  // Transform statusData to use reason as the status key for lookup
  const transformedStatusData = statusData ? {
    ...statusData,
    status: statusData.reason,
  } : undefined;

  return (
    <StatusBadge
      statusData={ transformedStatusData }
      map={CONSUMER_STATUS_MAP}
      unknownMessage="No status was retrieved from this consumer"
      formatFunction={ (msg?) => msg?.replace(/:/g, ":\n") }
    />
  );
}
