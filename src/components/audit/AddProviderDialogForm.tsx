import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';

type FieldType = 'string' | 'date' | 'file' | 'number' | 'boolean';

interface FieldSchema {
  type: FieldType;
  required: boolean;
  maxLength?: number;
  accept?: string;
}

interface FormType {
  [key: string]: FieldSchema;
}

interface FormSchema {
  [formType: string]: FormType;
}

const DynamicForm: React.FC = () => {
  const [formSchema, setFormSchema] = useState<FormSchema | null>(
    {
      "formExample": {
        "field1": { "type": "string", "required": true, "maxLength": 50 },
        "field2": { "type": "date", "required": false },
        "field3": { "type": "file", "required": true, "accept": "image/*" }
      },
      "gcp": {
        "project-id": { "type": "string", "required": true },
        "topic": { "type": "string", "required": true },
        "subscription": { "type": "string", "required": true }
      }
    }
  );
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // useEffect(() => {
  //   // Fetch the JSON structure
  //   const fetchFormSchema = async () => {
  //     const response = await fetch('/api/form-schema'); // Replace with your API endpoint
  //     const data: FormSchema = await response.json();
  //     setFormSchema(data);
  //   };

  //   fetchFormSchema();
  // }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const validateField = (field: string, value: any, schema: FieldSchema): string | null => {
    if (schema.required && !value) {
      return `${field} is required.`;
    }
    if (schema.type === 'string' && schema.maxLength && value.length > schema.maxLength) {
      return `${field} must not exceed ${schema.maxLength} characters.`;
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFormType || !formSchema) return;

    const fields = formSchema[selectedFormType];
    const errors: Record<string, string> = {};

    for (const [field, schema] of Object.entries(fields)) {
      const error = validateField(field, formValues[field], schema);
      if (error) {
        errors[field] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    console.log('Submitted Data:', formValues);
  };

  const handleFormTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formType = event.target.value;
    setSelectedFormType(formType);
    setFormValues({});
    setFormErrors({});
  };

  if (!formSchema) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Form Type Selector */}
      <label htmlFor="formType">Select Form Type:</label>
      <select id="formType" onChange={handleFormTypeChange} value={selectedFormType}>
        <option value="" disabled>
          -- Select a Form Type --
        </option>
        {Object.keys(formSchema).map((formType) => (
          <option key={formType} value={formType}>
            {formType}
          </option>
        ))}
      </select>

      {/* Render Form for Selected Type */}
      {selectedFormType && (
        <form onSubmit={handleSubmit}>
          {Object.entries(formSchema[selectedFormType]).map(([field, schema]) => {
            const { type, required, maxLength, accept } = schema;
            return (
              <div key={field}>
                <label>
                  {field} {required && '*'}
                </label>
                {type === 'string' && (
                  <input
                    type="text"
                    name={field}
                    maxLength={maxLength}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                )}
                {type === 'date' && (
                  <input
                    type="date"
                    name={field}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                )}
                {type === 'file' && (
                  <input
                    type="file"
                    name={field}
                    accept={accept}
                    onChange={(e) =>
                      handleInputChange(field, (e.target as HTMLInputElement).files?.[0])
                    }
                  />
                )}
                {type === 'number' && (
                  <input
                    type="number"
                    name={field}
                    onChange={(e) => handleInputChange(field, parseFloat(e.target.value))}
                  />
                )}
                {type === 'boolean' && (
                  <input
                    type="checkbox"
                    name={field}
                    onChange={(e) => handleInputChange(field, e.target.checked)}
                  />
                )}
                {formErrors[field] && <p style={{ color: 'red' }}>{formErrors[field]}</p>}
              </div>
            );
          })}
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default DynamicForm;
