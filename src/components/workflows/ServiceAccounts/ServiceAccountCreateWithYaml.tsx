import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateServiceAccount from "@/services/workflows/mutations/useCreateServiceAccount";
import YAML from "yaml";

/**
 * Generates a default YAML template for a ServiceAccount
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "external-secrets.io/v1",
    kind: "ServiceAccount",
    metadata: {
      name: "",
      namespace: "default",
    },
    data: {
      key: "value",
    },
  };
  return YAML.stringify(sampleManifest);
}

export function ServiceAccountCreateWithYaml() {
  const mutation = useCreateServiceAccount();

  return (
    <YamlFormWrapper
      resourceType="serviceaccount"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="ServiceAccount Manifest (YAML)"
      formDescription="Write your ServiceAccount configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secrets. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Create ServiceAccount"
      formId="secret-form"
    />
  );
}
