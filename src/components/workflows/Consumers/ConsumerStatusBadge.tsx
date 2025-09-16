import { Status, StatusMap } from "../Common.interfaces";
import { StatusBadge } from "../StatusBadge";

const CONSUMER_STATUS_MAP: StatusMap = {
  False: {
    variant: "warning",
    display: (s) => s.reason ?? "Pending Update",
    message: (s) => s.message ?? "Locations out to date",
  },
  True: {
    variant: "success",
    display: (s) => s.reason ?? "Ready",
    message: (s) => s.message ?? "Locations up to date",
  },
};

interface ConsumerStatusBadgeProps {
  statusData?: Status;
}
export function ConsumerStatusBadge({ statusData }: ConsumerStatusBadgeProps) {
  return (
    <StatusBadge
      statusData={ statusData }
      map={CONSUMER_STATUS_MAP}
      unknownMessage="No status was retrieved from this consumer"
      formatFunction={ (msg?) => msg?.replace(/:/g, ":\n") }
    />
  );
}
