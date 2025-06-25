import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import YAML from "yaml";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import useCreateSecretStore from "@/services/workflows/mutations/useCreateSecretStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

/**
 * Validates that the YAML content is a valid SecretStore manifest.
 * @param yamlContent - The YAML string to validate.
 * @param ctx - The Zod refinement context.
 */
const validateSecretStoreYaml = (yamlContent: string, ctx: z.RefinementCtx) => {
  if (!yamlContent) {
    return;
  }

  try {
    const doc = YAML.parseDocument(yamlContent, { strict: true, logLevel: "silent" });

    if (doc.errors.length > 0) {
      const firstError = doc.errors[0];
      const line = firstError.linePos?.[0]?.line ?? "YAML";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Parse error near line ${line}: ${firstError.message}`,
      });
      return;
    }

    if (!doc.contents) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "YAML content is empty or invalid." });
      return;
    }

    const manifest = doc.toJS();
    if (manifest.kind !== "SecretStore") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid resource kind: Expected "SecretStore", got "${manifest.kind || "unknown"}".`,
      });
    }
    if (!manifest.metadata?.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Manifest is missing required field: metadata.name",
      });
    }
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: e instanceof Error ? e.message : "An unknown error occurred during YAML parsing.",
    });
  }
};

const secretStoreFormSchema = z.object({
  yamlContent: z
    .string()
    .min(1, { message: "Manifest cannot be empty." })
    .superRefine(validateSecretStoreYaml),
});

type SecretStoreFormData = z.infer<typeof secretStoreFormSchema>;

/**
 * Generates a default YAML template for a SecretStore.
 * @returns A string containing the YAML template.
 */
function createDefaultYamlTemplate(): string {
  const sampleManifest = {
    apiVersion: "external-secrets.io/v1beta1",
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

interface SecretStoreCreateWithYamlProps {
  onCancel?: () => void;
}

export function SecretStoreCreateWithYaml({ onCancel }: SecretStoreCreateWithYamlProps) {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();

  const form = useForm<SecretStoreFormData>({
    resolver: zodResolver(secretStoreFormSchema),
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(getOrgLink("/secret-stores"));
    }
  };

  const onSubmit = (data: SecretStoreFormData) => {
    createSecretStore(
      { manifest: data.yamlContent },
      {
        onSuccess: () => {
          toast.success("Secret Store created successfully");
          navigate(getOrgLink("/secret-stores"));
        },
        onError: (error: unknown) => {
          let message = 'An unknown error occurred while creating the secret store.';
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response?: { data?: Record<string, unknown> } }).response;
            const errorData = response?.data;
            if (errorData) {
              const errorsArray = errorData.errors as [{ message: string }?];
              message =
                (errorData.error as string) ||
                (errorData.message as string) ||
                (errorsArray && errorsArray[0]?.message) ||
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
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
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
          <FormField
            control={form.control}
            name="yamlContent"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Secret Store Manifest (YAML)</FormLabel>
                <FormControl>
                  <CodeTextarea
                    {...field}
                    language="yaml"
                    placeholder="Enter YAML manifest"
                    className="min-h-[400px]"
                  />
                </FormControl>
                {error?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {error.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
