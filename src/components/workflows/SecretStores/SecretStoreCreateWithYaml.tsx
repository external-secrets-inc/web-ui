import { useEffect } from "react";
import { useForm } from "react-hook-form";
import YAML from "yaml";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldYaml } from "@/components/ui/fields/FieldYaml";
import useCreateSecretStore from "@/services/workflows/mutations/useCreateSecretStore";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

/**
 * Validates SecretStore-specific business logic.
 * @param yamlContent - The YAML string to validate.
 * @param parsedYaml - The parsed YAML object.
 * @returns Error message or null if valid.
 */
const validateSecretStoreManifest = (yamlContent: string, parsedYaml?: unknown): string | null => {
  if (!yamlContent || !parsedYaml) {
    return null;
  }

  const manifest = parsedYaml as Record<string, unknown>;

  if (manifest.kind !== "SecretStore") {
    return `Invalid resource kind: Expected "SecretStore", got "${manifest.kind || "unknown"}".`;
  }

  const metadata = manifest.metadata as Record<string, unknown> | undefined;
  if (!metadata?.name) {
    return "Manifest is missing required field: metadata.name";
  }

  return null;
};

interface SecretStoreFormData {
  yamlContent: string;
}

/**
 * Generates a default YAML template for a SecretStore.
 * @returns A string containing the YAML template.
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
              accessKeyIDSecretRef: { name: "awssm-secret", key: "accessKeyID" },
              secretAccessKeySecretRef: { name: "awssm-secret", key: "secretAccessKey" },
            },
          },
        },
      },
    },
  };
  return YAML.stringify(sampleManifest);
}

export function SecretStoreCreateWithYaml() {
  const navigate = useNavigate();

  const form = useForm<SecretStoreFormData>({
    defaultValues: {
      yamlContent: "",
    },
    mode: "onSubmit",
  });

  const { mutate: createSecretStore, isPending } = useCreateSecretStore();

  useEffect(() => {
    if (!form.getValues('yamlContent')) {
      const initialTemplate = createDefaultYamlTemplate();
      form.setValue('yamlContent', initialTemplate);
    }
  }, [form]);

  const onSubmit = (data: SecretStoreFormData) => {
    createSecretStore(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          toast.success("Secret Store created successfully");
          navigate("..");
        },
                        onError: (error: unknown) => {
          let message = 'An unknown error occurred while creating the secret store.';

          if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response?: { data?: Record<string, unknown> } }).response;
            const errorData = response?.data;
            if (errorData) {
              // Use the normalized error structure from AxiosInterceptor
              const errorsObject = errorData.errors as { body?: string };
              message =
                errorsObject?.body ||     // Consistent normalized format across all backends
                (errorData.error as string) ||
                (errorData.message as string) ||
                message;
            }
          } else if (error instanceof Error) {
            message = error.message;
          }

          form.setError('yamlContent', {
            type: 'server',
            message,
          });
        },
      },
    );
  };

  return (
    <>
      <LayoutPortalTopbarActions>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            asChild
            >
            <Link to="..">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Secret Store
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldYaml
            name="yamlContent"
            label="Secret Store Manifest (YAML)"
            description="Write your Secret Store configuration directly in YAML format. Perfect for power users who want full control, or when importing existing secret stores. Alternatively, you may use the Form Builder for a guided experience."
            placeholder="Enter YAML manifest"
            className="min-h-[400px]"
            descriptionInline={true}
            required
            rules={{
              validate: (value: string) => {
                if (!value) return true;

                try {
                  const parsedYaml = YAML.parse(value);
                  return validateSecretStoreManifest(value, parsedYaml);
                } catch {
                  // YAML parsing errors are handled by FieldYaml itself
                  return true;
                }
              }
            }}
          />
        </form>
      </Form>
    </>
  );
}
