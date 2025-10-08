import YAML from "yaml";
import { createYamlValidationRules, YamlFormWrapper } from "@/components/workflows";
import useCreateFederation from "@/services/federations/mutations/useCreateFederation";

/**
 * Generates a default YAML template for a Federation
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "federation.external-secrets.io/v1alpha1",
    kind: "KubernetesFederation",
    metadata: {
      name: "",
    },
    spec: {
      url: "https://kubeapi.client-alpha.example.com ",
    },
  };
  return YAML.stringify(sampleManifest);
}

export function customValidationForFederationManifest(
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

export function FederationCreateWithYaml() {
  const mutation = useCreateFederation();

  return (
    <YamlFormWrapper
      resourceType="federations"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Federation Manifest"
      formDescription="Define your federation using YAML. This should be a valid Kubernetes federation manifest."
      submitButtonText="Create Federation"
      formId="federation-yaml-form"
      validationRules={createYamlValidationRules("federations", customValidationForFederationManifest)}
    />
  );
}
