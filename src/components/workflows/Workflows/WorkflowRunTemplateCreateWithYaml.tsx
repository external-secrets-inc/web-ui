import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateWorkflowRunTemplate from "@/services/workflows/mutations/useCreateWorkflowRunTemplate";
import { useParams } from "react-router-dom";
import YAML from "yaml";

/**
 * Generates a default YAML template for a WorkflowRunTemplate
 */
function createDefaultYamlTemplate(
  templateNamespace: string,
  templateName: string
): string {
  const sampleManifest = {
    apiVersion: "workflows.external-secrets.io/v1alpha1",
    kind: "WorkflowRunTemplate",
    metadata: {
      name: templateName + "-run-template",
      namespace: templateNamespace,
    },
    spec: {
      runSpec: {
        templateRef: {
          name: templateName,
        },
        arguments: {
          storeName: "vault-backend",
          storesToDistribute:
            "k8s-store-market,k8s-store-shopping,k8s-store-shoeshop",
          keyToDistribute: "my-secret",
        },
      },
      revisionHistoryLimit: 1,
      runPolicy: {
        once: {},
      },
    },
  };

  return YAML.stringify(sampleManifest);
}

export function WorkflowRunTemplateCreateWithYaml() {
  const { templateNamespace, templateName } = useParams();
  const mutation = useCreateWorkflowRunTemplate();

  const createTemplate = () =>
    createDefaultYamlTemplate(templateNamespace ?? "", templateName ?? "");

  return (
    <YamlFormWrapper
      resourceType="workflowruntemplate"
      createDefaultTemplate={createTemplate}
      mutation={mutation}
      formLabel="Workflow Run Template Manifest (YAML)"
      formDescription="Write your Workflow Run Template configuration directly in YAML format. Perfect for power users who want full control, or when importing existing templates. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Create Run Template"
      formId="workflow-run-template-form"
    />
  );
}
