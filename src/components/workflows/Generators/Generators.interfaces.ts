import { Status } from "../Common.interfaces";

export interface GeneratorTableData {
  name: string;
  namespace: string;
  kind: string;
  status?: Status;
}

export interface CreateGeneratorPayload {
  manifest: string;
}

export interface DeleteGeneratorPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface GeneratorTypeOption {
  value: string;
  label: string;
}

export interface GeneratorType {
  name: string;
  description: string;
}