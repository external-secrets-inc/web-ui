import YAML from "yaml";
import { createYamlValidationRules, YamlFormWrapper } from "@/components/workflows";
import useCreateTarget from "@/services/workflows/mutations/useCreateTarget";

/**
 * Generates a default YAML template for a Target
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "target.external-secrets.io/v1alpha1",
    kind: "VirtualMachine",
    metadata: {
      name: "",
      namespace: "default",
    },
    spec: {
      url: "https://example.com",
      paths: [
        "/data",
        "/info"
      ],
      auth: {
        basic: {
          usernameSecretRef: {
            name: "vm-credentials",
            key: "username"
          },
          passwordSecretRef: {
            name: "vm-credentials",
            key: "password"
          }
        }
      }
    },
  };
  return YAML.stringify(sampleManifest);
}

/**
 * Custom validation for target manifest
 */
function customValidationForTargetManifest(parsedYaml?: unknown): string | null {
  if (!parsedYaml || typeof parsedYaml !== "object") {
    return "Invalid YAML structure";
  }

  const yaml = parsedYaml as Record<string, unknown>;

  // Check required fields
  if (!yaml.apiVersion || typeof yaml.apiVersion !== "string") {
    return "apiVersion is required and must be a string";
  }

  if (!yaml.kind || typeof yaml.kind !== "string") {
    return "kind is required and must be a string";
  }

  if (!yaml.metadata || typeof yaml.metadata !== "object") {
    return "metadata is required and must be an object";
  }

  const metadata = yaml.metadata as Record<string, unknown>;
  if (!metadata.name || typeof metadata.name !== "string") {
    return "metadata.name is required and must be a string";
  }

  if (!yaml.spec || typeof yaml.spec !== "object") {
    return "spec is required and must be an object";
  }

  const spec = yaml.spec as Record<string, unknown>;
  if (!spec.url || typeof spec.url !== "string") {
    return "spec.url is required and must be a string";
  }

  if (!spec.paths || !Array.isArray(spec.paths)) {
    return "spec.paths is required and must be an array";
  }

  return null;
}

export function TargetCreateWithYaml() {
  const mutation = useCreateTarget();

  return (
    <YamlFormWrapper
      resourceType="targets"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Target Manifest"
      formDescription="Define your target using YAML. This should be a valid Kubernetes target manifest."
      submitButtonText="Create Target"
      formId="target-yaml-form"
      validationRules={createYamlValidationRules("targets", customValidationForTargetManifest)}
    />
  );
}