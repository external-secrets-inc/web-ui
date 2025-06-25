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
