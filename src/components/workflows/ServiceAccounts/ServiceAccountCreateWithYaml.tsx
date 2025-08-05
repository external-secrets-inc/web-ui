import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateServiceAccount from "@/services/workflows/mutations/useCreateServiceAccount";
import YAML from "yaml";

/**
 * Generates a default YAML template for a ServiceAccount
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      name: "",
      namespace: "default",
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
      formLabel="Service Account Manifest (YAML)"
      formDescription="Write your ServiceAccount configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secrets. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Create Service Account"
      formId="serviceaccount-form"
    />
  );
}
