import { ListenerStatus } from './Audit.interfaces';

export const LISTENER_STATUS: Record<string, ListenerStatus> = {
  PENDING_INSTALLATION: 'PENDING_INSTALLATION',
  OFFLINE: 'OFFLINE',
} as const;