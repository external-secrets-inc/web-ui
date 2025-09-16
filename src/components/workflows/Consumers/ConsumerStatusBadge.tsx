import { useMemo } from "react";
import { Status, StatusMap } from "../Common.interfaces";
import { StatusBadge } from "../StatusBadge";

const CONSUMER_STATUS_MAP: StatusMap = {
  PendingUpdate: {
    variant: "warning",
    display: (s) => s.reason ?? "Pending Update",
    message: (s) => s.message ?? "Locations out to date",
  },
  UsingLatestVersion: {
    variant: "success",
    display: (s) => s.reason ?? "Ready",
    message: (s) => s.message ?? "Locations up to date",
  },
};

function processStatus(status?: Status) : Status | undefined {
  if(!status) {
    return undefined;
  }

  if(status.reason === "LocationsOutOfDate") {
    status.status = "PendingUpdate"
  } else if(status.reason === "LocationsUpToDate") {
    status.status = "UsingLatestVersion"
  }

  return status;
}

interface ConsumerStatusBadgeProps {
  statusData?: Status;
}
export function ConsumerStatusBadge({ statusData }: ConsumerStatusBadgeProps) {
  const processedStatus = useMemo(() => processStatus(statusData), [statusData]);

  return (
    <StatusBadge
      statusData={processedStatus}
      map={CONSUMER_STATUS_MAP}
      unknownMessage="No status was retrieved from this consumer"
      formatFunction={ (msg?) => msg?.replace(/:/g, ":\n") }
    />
  );
}
