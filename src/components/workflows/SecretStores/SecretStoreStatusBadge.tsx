import { Status, StatusMap } from "../Common.interfaces";
import { StatusBadge } from "../StatusBadge";

const STORE_STATUS_MAP: StatusMap = {
  Pending: {
    variant: "warning",
    display: "Pending",
    message: (s) => s.reason ?? "Unmapped status retrieved",
  },
  True: {
    variant: "success",
    display: (s) => s.reason ?? "Ready",
    message: (s) => s.message ?? "Valid secret store",
  },
  False: {
    variant: "destructive",
    display: (s) => s.reason ?? "Error",
    message: (s) => s.message ?? "Undefined error",
  },
};

interface SecretStoreStatusBadgeProps {
  statusData?: Status;
}

export function SecretStoreStatusBadge({
  statusData,
}: SecretStoreStatusBadgeProps) {
  return (
    <StatusBadge
      statusData={statusData}
      map={STORE_STATUS_MAP}
      unknownMessage="No status was retrieved from this secret store"
      formatFunction={ (msg?) => msg?.replace(/:/g, ":\n") }
    />
  );
}
