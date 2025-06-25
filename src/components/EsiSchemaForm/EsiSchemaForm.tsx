import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FieldRenderer } from '@/components/ui/fields/FieldRenderer';
import {
  assembleManifest,
  isFieldVisible,
} from './EsiSchemaForm.utils';
import type {
  UISchema,
  KubernetesResourceType,
  KubernetesManifest,
} from './EsiSchemaForm.interfaces';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface EsiSchemaFormProps {
  schema?: UISchema;
  resourceType: KubernetesResourceType;
  onSubmit: (manifest: KubernetesManifest) => void;
  submitButtonText?: string;
  formId?: string;
  disabled?: boolean;
  /**
   * Whether to hide the submit button at the bottom of the form.
   * Set to true when using form actions in a different location (e.g., topbar).
   * @default false
   */
  hideSubmitButton?: boolean;
}

export function EsiSchemaForm({
  schema,
  resourceType,
  onSubmit,
  submitButtonText = 'Create',
  formId = 'esi-schema-form',
  disabled = false,
  hideSubmitButton = false,
}: EsiSchemaFormProps) {
  // Field components handle their own defaults when they mount, so we use empty form defaults
  const defaultValues = {};

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = (data: Record<string, unknown>) => {
    const manifest = assembleManifest(data, resourceType, schema?.fields);
    onSubmit(manifest);
  };

  const formValues = methods.watch();

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
        <div className="space-y-6">
          {schema.fields
            .filter((field) => isFieldVisible(field.visibleWhen, formValues))
            .map((field) => (
              <FieldRenderer key={field.id} field={field} />
            ))}
        </div>

        {!hideSubmitButton && (
        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            {submitButtonText}
          </Button>
        </div>
        )}
      </form>
    </Form>
  );
}