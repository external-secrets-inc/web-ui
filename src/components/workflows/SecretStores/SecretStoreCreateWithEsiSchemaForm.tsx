import { useState } from "react";
import YAML from "yaml";
import { Button } from "@/components/ui/button";
import { EsiSchemaForm, type KubernetesManifest } from "@/components/EsiSchemaForm";
import useCreateSecretStore from "@/services/workflows/mutations/useCreateSecretStore";
import useGetUISchema from "@/services/esi-schemas/queries/useGetUISchema";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import { LayoutPortalTopbarActions } from "@/components/layout/LayoutPortalTopbarActions";
import { Loader } from "@/components/ui/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecretStoreCreateWithEsiSchemaFormProps {
  onCancel?: () => void;
}

/**
 * Extracts a user-friendly error message from API error responses.
 * This function handles various error formats, including plain text responses
 * and common JSON error structures.
 * @param error - The error object from the API response.
 * @returns A formatted error message string.
 */
function extractErrorMessage(error: unknown): string {
  const defaultMessage = 'An unknown error occurred while creating the secret store.';

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const errorData = (error as { response?: { data?: unknown } }).response?.data;

    if (!errorData) {
      return defaultMessage;
    }

    let potentialObject = errorData;
    let message: string | null = null;

    if (typeof errorData === 'string' && errorData.length > 0) {
      try {
        const parsed = JSON.parse(errorData);
        if (typeof parsed === 'object' && parsed !== null) {
          potentialObject = parsed;
        } else {
          message = errorData;
        }
      } catch {
        message = errorData;
      }
    }

    if (typeof potentialObject === 'object' && potentialObject !== null) {
      const data = potentialObject as Record<string, unknown>;

      if (typeof data.message === 'string' && data.message) {
        message = data.message;
      } else if (typeof data.error === 'string' && data.error) {
        message = data.error;
      } else if (Array.isArray(data.errors) && data.errors.length > 0 && typeof data.errors[0]?.message === 'string') {
        message = data.errors[0].message;
      } else if (typeof data.errors === 'object' && data.errors !== null) {
        const nestedError = (data.errors as Record<string, unknown>).error;
        if (typeof nestedError === 'string') {
          message = nestedError;
        }
      }
    }

    // Replace literal '\\n' with actual newlines for proper rendering.
    if (message) {
      return message.replace(/\\n/g, '\n');
    }
  }

  if (error instanceof Error) {
    return error.message.replace(/\\n/g, '\n');
  }

  return defaultMessage;
}

export function SecretStoreCreateWithEsiSchemaForm({ onCancel }: SecretStoreCreateWithEsiSchemaFormProps) {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: schema, isLoading, error } = useGetUISchema("secretstore");
  const { mutate: createSecretStore, isPending } = useCreateSecretStore();

  const formId = "secret-store-form";

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(getOrgLink("/workflows/secret-stores"));
    }
  };

  const handleSubmit = (manifest: KubernetesManifest) => {
    // Clear any previous server errors
    setServerError(null);

    const yamlContent = YAML.stringify(manifest);

    createSecretStore(
      { manifest: yamlContent },
      {
        onSuccess: () => {
          toast.success("Secret Store created successfully");
          navigate(getOrgLink("/workflows/secret-stores"));
        },
        onError: (error: unknown) => {
          const errorMessage = extractErrorMessage(error);
          setServerError(errorMessage);
          toast.error("Failed to create Secret Store");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        Failed to load form schema. Please try again.
      </div>
    );
  }

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
            form={formId}
            disabled={isPending}
            className="grid place-items-center"
          >
            {isPending && <Loader className="[grid-area:1/1]" />}
            <span className={cn(isPending && "invisible", "[grid-area:1/1]")}>
              Create Secret Store
            </span>
          </Button>
        </div>
      </LayoutPortalTopbarActions>

      <div className="space-y-6">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Server Error</AlertTitle>
            <AlertDescription className="font-medium">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        <EsiSchemaForm
          schema={schema}
          resourceType="secretstore"
          onSubmit={handleSubmit}
          formId={formId}
          disabled={isPending}
          hideSubmitButton
        />
      </div>
    </>
  );
}