import YAML from "yaml";
import { createYamlValidationRules, YamlFormWrapper } from "@/components/workflows";
import useCreateAuthorization from "@/services/federations/mutations/useCreateAuthorization";

/**
 * Generates a default YAML template for a Authorization
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "federation.external-secrets.io/v1alpha1",
    kind: "Authorization",
    metadata: {
      name: "allow-alpha-monitoring",
      namespace: "default",
    },
    spec: {
      federationRef: {
        kind: "KubernetesFederation",
        name: "",
      },
      subject: {
        issuer: "https://kubernetes.default.svc.cluster.local",
        subject: "system:serviceaccount:monitoring:prometheus-esi-client",
      },
      allowedClusterSecretStores: [
        "vault-prod",
      ],
    },
  };
  return YAML.stringify(sampleManifest);
}

export function customValidationForAuthorizationManifest(
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

export function AuthorizationCreateWithYaml() {
  const mutation = useCreateAuthorization();

  return (
    <YamlFormWrapper
      resourceType="authorizations"
      createDefaultTemplate={createDefaultYamlTemplate}
      mutation={mutation}
      formLabel="Authorization Manifest"
      formDescription="Define your authorization using YAML. This should be a valid Kubernetes authorization manifest."
      submitButtonText="Create Authorization"
      formId="authorization-yaml-form"
      validationRules={createYamlValidationRules("authorizations", customValidationForAuthorizationManifest)}
    />
  );
}
