import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldBase } from './FieldBase';
import { FieldHeader } from './FieldHeader';
import { FieldSelect } from './FieldSelect';
import { FieldText } from './FieldText';
import { type SelectOption, type UISchemaField } from '@/components/EsiSchemaForm/EsiSchemaForm.interfaces';

export interface FieldSecretSelectProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rules?: Record<string, unknown>;
  defaultValue?: string;
  descriptionInline?: boolean;
  disabled?: boolean;
}

interface Secret {
  name: string;
  namespace: string;
}

export function FieldSecretSelect({
  name,
  label,
  description,
  required,
  rules,
  descriptionInline,
  disabled
}: FieldSecretSelectProps) {
  const { formState } = useFormContext();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldError = !!formState.errors[name];

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implement getSecrets API call when secrets endpoint is available
        // For now, provide empty array to prevent errors
        setSecrets([]);
      } catch {
        setError('Failed to load secrets');
      } finally {
        setLoading(false);
      }
    };

    fetchSecrets();
  }, []);

  const secretOptions: SelectOption[] = secrets.map((secret) => ({
    value: secret.name,
    label: `${secret.namespace}/${secret.name}`,
  }));

  /**
   * Mock UISchemaField for the secret name selection.
   *
   * Since this component is standalone (not part of an ESI schema), we create
   * a minimal field definition to satisfy the FieldSelect component's interface.
   * This enables the component to use the same FieldSelect logic while maintaining
   * its independence from the schema system.
   *
   * @see FieldSelect - Requires a field prop of type UISchemaField
   * @see useGetEsiSchemaOptions - Could potentially use this field for dynamic options
   */
  const mockField: UISchemaField = useMemo(() => ({
    id: `${name}.name`,
    label: 'Name',
    type: 'select',
    required: !!required,
  }), [name, required]);

  return (
    <FieldBase
      name={name}
      rules={rules}
      defaultValue={{}}
      renderCustomLayout
    >
      <>
        <FieldHeader
          label={label}
          description={description}
          required={required}
          labelAsText
          error={fieldError}
          descriptionInline={descriptionInline}
        />
        <div className="pl-3 pt-2 border-l border-border space-y-6" data-nested-group>
          <div className="flex space-x-2">
            <div className="flex-1">
              <FieldSelect
                field={mockField}
                name={`${name}.name`}
                label="Name"
                required={required}
                rules={{
                  required: required ? "Secret name is required" : false,
                }}
                options={secretOptions}
                placeholder="Select a secret"
                loading={loading}
                error={error}
                emptyMessage="No secrets available. Create secrets in your cluster first."
                allowClear={false}
                disabled={disabled}
              />
            </div>
            <div className="flex-1">
              <FieldText
                name={`${name}.key`}
                label="Key"
                required={required}
                rules={{
                  required: required ? "Secret key is required" : false,
                }}
                placeholder="Secret key"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </>
    </FieldBase>
  );
}