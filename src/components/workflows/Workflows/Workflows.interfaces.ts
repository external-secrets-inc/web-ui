import { Status } from "../Common.interfaces";

export interface WorkflowTemplateTableData {
  name: string;
  namespace: string;
  status: Status
}

export interface CreateWorkflowTemplatePayload {
  manifest: string;
}

export interface DeleteWorkflowTemplatePayload {
  namespace: string;
  name: string;
}

export interface WorkflowRunTemplateTableData {
  name: string;
  namespace: string;
  status: Status
  runPolicy: string;
  lastRuns: WorkflowRunData[];
}

export interface GetWorkflowRunTemplatesByTemplate {
  templateName: string;
  templateNamespace: string;
}

export interface CreateWorkflowRunTemplatePayload {
  manifest: string;
}

export interface DeleteWorkflowRunTemplatePayload {
  namespace: string;
  name: string;
}

export interface WorkflowRunData {
  name: string;
  namespace: string;
  templateRef: TemplateRef;
  parameters: Record<string, string>;
  variables: Record<string, string>;
  phase: string;
  startTime?: Date;
  completionTime?: Date;
  workflowRef?: WorkflowRef;
}

export interface TemplateRef {
  name: string;
  namespace: string;
}

export interface WorkflowRef {
  name: string;
  namespace: string;
}

export interface CreateWorkflowRunFromRunTemplatePayload {
  runTemplateName: string;
  runTemplateNamespace: string;
  runName: string;
}
