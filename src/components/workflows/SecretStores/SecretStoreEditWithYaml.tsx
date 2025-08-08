import { YamlFormWrapper } from "@/components/workflows/YamlFormWrapper";
import useUpdateSecretStore from "@/services/workflows/mutations/useUpdateSecretStore";

export function SecretStoreEditWithYaml({ manifest } : { manifest: string }) {
  const mutation = useUpdateSecretStore();

  return (
    <YamlFormWrapper
      resourceType="secretstore"
      createDefaultTemplate={() => manifest}
      mutation={mutation}
      formLabel="Secret Store Manifest (YAML)"
      formDescription="Write your Secret Store configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secret stores. Alternatively, you may use the Form Builder for a guided experience."
      submitButtonText="Edit Secret Store"
      formId="secret-store-form"
    />
  );
}
