export interface TargetTableData {
  name: string;
  namespace: string;
  kind: string;
}

export interface CreateTargetPayload {
  manifest: string;
}

export interface DeleteTargetPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface TargetType {
  name: string;
  description: string;
}