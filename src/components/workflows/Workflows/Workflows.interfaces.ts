import { Status } from "../Common.interfaces";

// Workflow Templates
export interface WorkflowTemplateTableData {
  name: string;
  namespace: string;
  status: Status;
}

export interface WorkflowTemplateData {
  name: string;
  namespace: string;
  status: Status;
  manifest: string;
  parameters: WorkflowTemplateParameter[];
}

export interface WorkflowTemplateParameter {
  ID: string;
  name: string;
  description: string;
  required: boolean;
  defaultValue: string;
}

export interface GetWorkflowTemplatePayload {
  namespace: string;
  name: string;
}

export interface CreateWorkflowTemplatePayload {
  manifest: string;
}

export interface DeleteWorkflowTemplatePayload {
  namespace: string;
  name: string;
}

// Workflows
export interface WorkflowTableData {
  name: string;
  namespace: string;
  status: Status;
  phase: string;
  startTime: string;
  completionTime: string;
}

export interface WorkflowData {
  name: string;
  namespace: string;
  status: Status;
  manifest: string;
  phase: string;
  jobs: Record<string, WorkflowJob>;
  startTime?: string;
  completionTime?: string;
  createdFromTemplate?: boolean;
  templateRef?: TemplateRef;
  workflowRunRef?: WorkflowRunRef;
  variables?: Record<string, string>;
}

export interface WorkflowJob {
  phase: string;
  startTime?: Date;
  completionTime?: Date;
  type: string;
  steps: Record<string, WorkflowStep>;
  dependsOn: string[];
}

export interface WorkflowStep {
  type: string;
  phase: string;
  startTime?: Date;
  completionTime?: Date;
  outputs: Record<string, unknown>;
}

export interface GetWorkflowPayload {
  namespace: string;
  name: string;
}

export interface WorkflowRunTemplateTableData {
  name: string;
  namespace: string;
  status: Status;
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
  startTime?: string;
  completionTime?: string;
  workflowRef?: WorkflowRef;
}

export interface TemplateRef {
  name: string;
  namespace: string;
}

export interface WorkflowRunRef {
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

export interface GetWorkflowRunPayload {
  namespace: string;
  name: string;
}
