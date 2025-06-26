import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FieldRenderer } from '@/components/ui/fields/FieldRenderer';
import {
  assembleManifest,
  isFieldVisible,
  extractErrorMessage,
  getSuccessMessage,
} from './EsiSchemaForm.utils';
import type {
  UISchema,
  KubernetesResourceType,
  KubernetesManifest,
} from './EsiSchemaForm.interfaces';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  submitButtonText = 'Create',
  formId = 'esi-schema-form',
  disabled = false,
  hideSubmitButton = false,
  successMessage,
  onSuccess,
  onError,
}: EsiSchemaFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field components handle their own defaults when they mount, so we use empty form defaults
  const defaultValues = {};

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const manifest = assembleManifest(data, resourceType, schema?.fields);
      await onSubmit(manifest);

      const message = successMessage || getSuccessMessage(resourceType);
      toast.success(message);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setServerError(errorMessage);
      toast.error(`Failed to create ${resourceType}`);

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
        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>Server Error</AlertTitle>
            <AlertDescription className="font-medium">
              {serverError}
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