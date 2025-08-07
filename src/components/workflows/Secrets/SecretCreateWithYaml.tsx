import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateSecret from "@/services/workflows/mutations/useCreateSecret";
import YAML from "yaml";

/**
 * Generates a default YAML template for a Secret
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: "",
      namespace: "default",
    },
    stringData: {
      key: "value",
    },
  };
  return YAML.stringify(sampleManifest);
}

export function SecretCreateWithYaml() {
  const mutation = useCreateSecret();

  return (
    <YamlFormWrapper
      resourceType="secret"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Secret Manifest (YAML)"
      formDescription="Write your Secret configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secrets. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Create Secret"
      formId="secret-form"
    />
  );
}
