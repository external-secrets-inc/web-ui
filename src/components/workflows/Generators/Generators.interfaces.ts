import { Status } from "../Common.interfaces";

export interface GeneratorTableData {
  name: string;
  namespace: string;
  kind: string;
}

export interface CreateGeneratorPayload {
  manifest: string;
}

export interface DeleteGeneratorPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface GeneratorType {
  name: string;
  description: string;
}

export interface GeneratorData {
  name: string;
  namespace: string;
  kind: string;
  status: GeneratorStatus
  manifest: string;
}

export interface GeneratorStatus {
  output?: Record<string, string>;
}

export interface GetGeneratorPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface GeneratorStateTableData {
  name: string;
  namespace: string;
  status: Status
}

export interface DeleteGeneratorStatePayload {
  namespace: string;
  name: string;
}

export interface GetGeneratorStatesByResource {
  resourceName: string;
  resourceNamespace: string;
}
