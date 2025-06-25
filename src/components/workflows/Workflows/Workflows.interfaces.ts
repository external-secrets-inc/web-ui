import { Status } from "../Common.interfaces";

// Workflow Templates
export interface WorkflowTemplateTableData {
  name: string;
  namespace: string;
  status: Status;
}

export interface CreateWorkflowTemplatePayload {
  manifest: string;
}

export interface DeleteWorkflowTemplatePayload {
  namespace: string;
  name: string;
}

// Workflows
export interface WorkflowRunTableData {
  name: string;
  namespace: string;
  status: Status;
  phase: string;
  startTime: string;
  completionTime: string;
}

export interface WorkflowRunData {
  name: string;
  namespace: string;
  status: Status;
  manifest: string;
  phase: string;
  jobs: Record<string, WorkflowJob>;
  startTime?: string;
  completionTime?: string;
  createdFromTemplate?: boolean;
  emplateRef?: TemplateRef;
  workflowRunRef?: WorkflowRunRef;
  variables?: Record<string, string>;
}

export interface WorkflowJob {
  phase: string;
  startTime?: Date;
  completionTime?: Date;
  type: "standard" | "loop" | "switch";
  steps: Record<string, WorkflowStep>;
}

export interface WorkflowStep {
  type: string;
  phase: string;
  startTime?: Date;
  completionTime?: Date;
  outputs: Record<string, unknown>;
}

export interface GetWorkflowRunPayload {
  namespace: string;
  name: string;
}

interface TemplateRef {
    name: string;
    namespace: string;
}

interface WorkflowRunRef {
    name: string;
    namespace: string;
}
