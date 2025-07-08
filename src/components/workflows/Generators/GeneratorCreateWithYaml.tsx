import YAML from "yaml";
import { createYamlValidationRules, YamlFormWrapper } from "@/components/workflows";
import useCreateGenerator from "@/services/workflows/mutations/useCreateGenerator";

/**
 * Generates a default YAML template for a Generator
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "generators.external-secrets.io/v1alpha1",
    kind: "Password",
    metadata: {
      name: "",
      namespace: "default",
    },
    spec: {
      length: 32,
      digits: 8,
      symbols: 8,
      symbolCharacters: "!@#$%^&*()_+-=[]{}|;:,.<>?",
      noUpper: false,
      allowRepeat: false,
    },
  };
  return YAML.stringify(sampleManifest);
}

export function customValidationForGeneratorManifest(
  parsedYaml?: unknown
): string | null {
  if (!parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  const metadata = manifest.metadata as Record<string, unknown> | undefined;
  if (!metadata?.name) {
    return "Manifest is missing required field: metadata.name";
  }

  return null;
}

export function GeneratorCreateWithYaml() {
  const mutation = useCreateGenerator();

  return (
    <YamlFormWrapper
      resourceType="generators"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Generator Manifest"
      formDescription="Define your generator using YAML. This should be a valid Kubernetes generator manifest."
      submitButtonText="Create Generator"
      formId="generator-yaml-form"
      validationRules={createYamlValidationRules("generators", customValidationForGeneratorManifest)}
    />
  );
}
