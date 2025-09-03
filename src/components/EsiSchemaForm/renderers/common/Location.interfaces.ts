export interface LocationApiOption {
  name?: string;
  apiVersion?: string;
  kind?: string;
  remoteRef?: { key?: string; property?: string };
  label?: string;
  [key: string]: unknown;
}
