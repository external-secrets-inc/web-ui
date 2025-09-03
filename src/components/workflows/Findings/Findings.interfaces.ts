export interface FindingLocation {
  name: string;
  apiVersion: string;
  kind: "SecretStore" | string;
  remoteRef: {
    key: string;
    property: string;
  };
}

export interface WorkflowTemplateCandidate {
  name: string;
  namespace: string;
}

export interface Finding {
  name: string;
  namespace: string;
  locations: FindingLocation[];
  workflowTemplateCandidates: WorkflowTemplateCandidate[];
  parsedName?: string;
  kind?: string;
  key?: string;
  id?: string;
  displayName?: string;
}

export type FindingsTableData = Pick<Finding, "name" | "namespace" | "locations">;
