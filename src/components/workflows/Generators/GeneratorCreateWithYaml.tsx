import YAML from "yaml";
import { YamlFormWrapper, createYamlValidationRules } from "@/components/workflows";
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
      digits: true,
      symbols: true,
      symbolCharacters: "!@#$%^&*()_+-=[]{}|;:,.<>?",
      noUpper: false,
      allowRepeat: false,
    },
  };
  return YAML.stringify(sampleManifest);
}

/**
 * Custom validation for generator manifests
 * Generators have multiple valid kinds unlike other resources
 * TODO[cfviotti]: This is a temporary solution to validate generator manifests. Maybe we could leverage the generator endpoints to get a list of valid kinds.
 */
function validateGeneratorManifest(parsedYaml?: unknown): string | null {
  if (!parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  const validGeneratorKinds = [
    "Password", "AWSIAMKey", "BasicAuth", "PostgreSQL", "SSH", "RabbitMQ",
    "ACRAccessToken", "ECRAuthorizationToken", "GCRAccessToken", "QuayAccessToken",
    "GithubAccessToken", "SendgridAuthorizationToken", "STSSessionToken",
    "VaultDynamicSecret", "UUID", "Webhook", "MFA", "Grafana", "MongoDB",
    "Neo4j", "Federation", "Fake", "GeneratorState", "ClusterGenerator"
  ];

  const kind = manifest.kind as string;
  if (!kind || !validGeneratorKinds.includes(kind)) {
    return `Invalid generator kind: Expected one of [${validGeneratorKinds.join(", ")}], got "${kind || "unknown"}".`;
  }

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
      validationRules={createYamlValidationRules("generators", validateGeneratorManifest)}
    />
  );
}