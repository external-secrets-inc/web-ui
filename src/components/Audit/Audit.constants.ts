import { ListenerStatus } from './Audit.interfaces';
import type { TimeRangeOption } from './Audit.interfaces';
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "@/constants";

export const LISTENER_STATUS: Record<string, ListenerStatus> = {
  PENDING_INSTALLATION: 'pending',
  OFFLINE: 'offline',
  ACTIVE: 'active',
} as const;

export const TIME_RANGES: TimeRangeOption[] = [
  { days: 0, label: 'Now' },
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
] as const;

// TODO[cfviotti]: This can still yield unsynced data from Audit page vs inner queries. Investigate alternative approaches that keep data in sync.
export const AUDIT_PAGE_QUERY_REFETCH_INTERVAL = 5 * ONE_MINUTE_IN_SECONDS * ONE_SECOND_IN_MILLISECONDS;
export const AUDIT_QUERY_STALE_TIME = AUDIT_PAGE_QUERY_REFETCH_INTERVAL - 30 * ONE_SECOND_IN_MILLISECONDS;
