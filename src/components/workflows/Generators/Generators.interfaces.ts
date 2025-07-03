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