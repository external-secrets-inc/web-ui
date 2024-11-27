import { ListenerStatus } from './Audit.interfaces';

export const LISTENER_STATUS: Record<string, ListenerStatus> = {
  PENDING_REGISTRATION: 'PENDING_REGISTRATION',
  OFFLINE: 'OFFLINE',
} as const;