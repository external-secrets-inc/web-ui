import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/ui/fields/FieldRenderer";
import { Form } from "@/components/ui/form";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  KubernetesManifest,
  KubernetesResourceType,
  UISchema,
} from "./EsiSchemaForm.interfaces";
import {
  assembleManifest,
  extractErrorMessage,
  getResourceConfig,
  getSuccessMessage,
  isFieldVisible,
} from "./EsiSchemaForm.utils";

export interface EsiSchemaFormProps {
  schema?: UISchema;
  resourceType: KubernetesResourceType;
  onSubmit: (manifest: KubernetesManifest) => Promise<void>;
  submitButtonText?: string;
  formId?: string;
  disabled?: boolean;
  /**
   * Whether to hide the submit button at the bottom of the form.
   * Set to true when using form actions in a different location (e.g., topbar).
   * @default false
   */
  hideSubmitButton?: boolean;
  /**
   * Optional success message. If not provided, a default message will be generated
   * based on the resource type.
   */
  successMessage?: string;
  /**
   * Optional callback to execute after successful submission.
   */
  onSuccess?: () => void;
  /**
   * Optional callback to execute when an error occurs during submission.
   * Receives the extracted error message as a parameter.
   */
  onError?: (errorMessage: string) => void;
}

export function EsiSchemaForm({
  schema,
  resourceType,
  onSubmit,
  submitButtonText = "Create",
  formId = "esi-schema-form",
  disabled = false,
  hideSubmitButton = false,
  successMessage,
  onSuccess,
  onError,
}: EsiSchemaFormProps) {
  const [errorState, setErrorState] = useState<{
    message: string;
    isClientError: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);

  // Focus on alert when error state changes to show error
  useEffect(() => {
    if (errorState && alertRef.current) {
      alertRef.current.focus();
    }
  }, [errorState]);

  // Field components handle their own defaults when they mount, so we use empty form defaults
  const defaultValues = {};

  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);

    let backendCallAttempted = false;

    try {
      // First, try to assemble the manifest (client-side validation)
      const manifest = assembleManifest(data, resourceType, schema?.fields);

      // If we reach here, manifest assembly succeeded, now try the backend call
      backendCallAttempted = true;
      await onSubmit(manifest);

      // Only clear error state on successful submission
      setErrorState(null);

      const message = successMessage || getSuccessMessage(resourceType);
      toast.success(message);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      const isClientError = !backendCallAttempted;

      setErrorState({ message: errorMessage, isClientError });

      let resourceName: string;
      try {
        resourceName = getResourceConfig(resourceType).displayName;
      } catch {
        resourceName = resourceType;
      }

      toast.error(`Failed to create ${resourceName}`);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formValues = methods.watch();
  const isFormDisabled = disabled || isSubmitting;

  if (!schema) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No schema available for this resource type.</AlertTitle>
        <AlertDescription />
      </Alert>
    );
  }

  return (
    <Form {...methods}>
      <form
        id={formId}
        onSubmit={methods.handleSubmit(handleSubmit)}
        className="space-y-6 [&_[data-nested-group]:hover:not(:has([data-nested-group]:hover))]:border-input-accent [&_[data-nested-group]:has([data-nested-group]:hover)]:border-muted"
      >
        {errorState && (
          <Alert ref={alertRef} variant="destructive" tabIndex={-1}>
            <AlertTitle>
              {errorState.isClientError
                ? "Data Processing Error"
                : "Server Error"}
            </AlertTitle>
            <AlertDescription className="font-medium">
              {errorState.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {schema.fields
            .filter((field) => isFieldVisible(field.visibleWhen, formValues))
            .map((field) => (
              <FieldRenderer key={field.id} field={field} />
            ))}
        </div>

        {!hideSubmitButton && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isFormDisabled}>
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
