import { ListenerStatus } from './Audit.interfaces';
import type { TimeRangeOption } from './Audit.interfaces';

export const LISTENER_STATUS: Record<string, ListenerStatus> = {
  PENDING_INSTALLATION: 'PENDING_INSTALLATION',
  OFFLINE: 'OFFLINE',
} as const;

export const TIME_RANGES: TimeRangeOption[] = [
  { days: 0, label: 'Now' },
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
] as const;