import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useCreateSecretStore from "@/services/workflows/mutations/useCreateSecretStore";
import YAML from "yaml";

/**
 * Generates a default YAML template for a SecretStore
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "external-secrets.io/v1",
    kind: "SecretStore",
    metadata: {
      name: "",
      namespace: "default",
    },
    spec: {
      provider: {
        aws: {
          service: "SecretsManager",
          region: "us-east-1",
          auth: {
            secretRef: {
              accessKeyIDSecretRef: {
                name: "awssm-secret",
                key: "accessKeyID",
              },
              secretAccessKeySecretRef: {
                name: "awssm-secret",
                key: "secretAccessKey",
              },
            },
          },
        },
      },
    },
  };
  return YAML.stringify(sampleManifest);
}

export function SecretStoreCreateWithYaml() {
  const mutation = useCreateSecretStore();

  return (
    <YamlFormWrapper
      resourceType="secretstore"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Secret Store Manifest (YAML)"
      formDescription="Write your Secret Store configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secret stores. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Create Secret Store"
      formId="secret-store-form"
    />
  );
}
