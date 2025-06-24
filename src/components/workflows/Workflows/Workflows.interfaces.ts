export interface WorkflowTemplateTableData {
  name: string;
  namespace: string;
  status: {
    status: string,
    reason: string
  }
}

export interface CreateWorkflowTemplatePayload {
  manifest: string;
}

export interface DeleteWorkflowTemplatePayload {
  namespace: string;
  name: string;
}
