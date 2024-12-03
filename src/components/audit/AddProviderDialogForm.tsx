import { useState, useEffect } from 'react';
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { capitalizeWords } from '@/helpers/stringsHelpers';
import { AddProviderFieldSchema, AddProviderFormSchema, CreateProviderPayload } from './Audit.interfaces';
import useGetProvidersTypes from '@/services/audit/queries/useGetProvidersType';
import { handleDefaultApiHttpError } from '@/services/servicesHelpers';

const baseSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  type: z.string().min(1, { message: "Type is required." }),
});

const renderInputField = (
  schema: AddProviderFieldSchema,
  field: string,
  fieldProps: ControllerRenderProps<Record<string, string>, string>
) => {
  switch (schema.type) {
    case "string":
      return (
        <Input
          placeholder={`Enter ${field}`}
          maxLength={schema.maxLength}
          {...fieldProps}
        />
      );
    case "date":
      return <Input type="date" {...fieldProps} />;
    case "file":
      return (
        <Input
          type="file"
          onChange={(e) =>
            fieldProps.onChange((e.target as HTMLInputElement).files?.[0])
          }
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={`Enter ${field}`}
          onChange={(e) => fieldProps.onChange(parseFloat(e.target.value))}
        />
      );
    case "boolean":
      return (
        <Input
          type="checkbox"
          checked={fieldProps.value == "true"? true :  fieldProps.value == "false"? false : undefined}
          onChange={(e) => fieldProps.onChange(e.target.checked)}
        />
      );
    default:
      return null;
  }
};

const AddProviderDialogForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: CreateProviderPayload) => void;
  onCancel: () => void;
}) => {
  const [formSchemaData, setFormSchema] = useState<AddProviderFormSchema>(
    {
      "formExample": {
        "field1": { "type": "string", "required": true, "maxLength": 50 },
        "field2": { "type": "date", "required": false },
        "field3": { "type": "file", "required": true, "accept": "image/*" },
        "field4": { "type": "number", "required": true },
        "field5": { "type": "boolean", "required": true },
      },
      "gcp": {
        "project-id": { "type": "string", "required": true },
        "topic": { "type": "string", "required": true },
        "subscription": { "type": "string", "required": true }
      }
    }
  );
  const [selectedFormType, setSelectedFormType] = useState<string>('');

  const { data: providersTypeData, isLoading: providersTypesIsLoading, isError: providersTypesIsError, error: providersTypesError } = useGetProvidersTypes(true);

  const providersTypes = providersTypeData?? {};
  useEffect(() => {
    setFormSchema(providersTypes);
  }, [providersTypes]);

  useEffect(() => {
    if (!(providersTypesError)) return;

    handleDefaultApiHttpError(providersTypesError, "Error while fetching listener Audit data")
  }, [providersTypesError, providersTypesIsError])

  const generateZodSchema = (formType: string) => {
    const fields = formSchemaData[formType];
    const dynamicSchema = Object.entries(fields).reduce<Record<string, z.ZodType>>((acc, [key, value]) => {
      switch (value.type) {
        case "string":
          acc[key] = value.required
            ? z
              .string()
              .min(1, { message: `${key} is required.` })
              .max(value.maxLength || Infinity)
            : z.string().max(value.maxLength || Infinity).optional();
          break;
        case "date":
          acc[key] = value.required ? z.string().min(1) : z.string().optional();
          break;
        case "file":
          acc[key] = value.required ?
            z.instanceof(File).refine((file) => file.size > 0, { message: `${key} must not be empty.` })
            : z.instanceof(File).optional();
          break;
        case "number":
          acc[key] = value.required
            ? z.number({ invalid_type_error: `${key} must be a number.` })
            : z.number().optional();
          break;
        case "boolean":
          acc[key] = value.required ? z.boolean() : z.boolean().optional();
          break;
        default:
          acc[key] = z.unknown();
      }
      return acc;
    }, {});

    return baseSchema.merge(z.object(dynamicSchema));
  };

  const formSchema = selectedFormType ? generateZodSchema(selectedFormType) : baseSchema;

  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: selectedFormType
      ? Object.keys(formSchemaData[selectedFormType]).reduce<Record<string, string>>((acc, key) => {
        acc[key] = "";
        return acc;
      }, {})
      : {},
  });

  const handleFormTypeChange = (value: string) => {
    setSelectedFormType(value);
    form.reset({
      ...form.getValues(),
      type: value,
    });
  };

  const handleSubmit = (formValues: Record<string, string | boolean | File | number>) => {
    const { name, type, ...customFields } = formValues;

    const config = Object.entries(customFields).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "boolean") {
        acc[key] = value ? "true" : "false"; // Converte boolean para string
      } else if (value instanceof File) {
        acc[key] = value.name; // Usa o nome do arquivo para File
      } else if (typeof value === "number") {
        acc[key] = value.toString(); // Converte número para string
      } else if (typeof value === "string") {
        acc[key] = value; // Já é string
      }
      return acc;
    }, {});

    onSubmit({
      listenerID: "",
      tenantID: "",
      name: String(name),
      backendIdentifier: String(name),
      backendType: String(type),
      config: config,
    });
  }

  const handleCancel = () => {
    form.reset({
      ...form.getValues(),
      type: "",
      name: "",
    });
    onCancel();
  }

  if (providersTypesIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Add Provider</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value); // Update the form state
                      handleFormTypeChange(value); // Handle type-specific logic
                    }}
                  >
                    <SelectTrigger >
                      <SelectValue placeholder="Select the provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(formSchemaData).map((formType) => (
                        <SelectItem key={formType} value={formType}>
                          {formType}
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedFormType && (
            <>
              <div className="pt-4">
                <h2 className="text-lg font-semibold text-gray-300">Configuration</h2>
              </div>
              {
                Object.entries(formSchemaData[selectedFormType]).map(([field, schema]) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field}
                    render={({ field: fieldProps }) => (
                      <FormItem>
                        <FormLabel>{capitalizeWords(field)}</FormLabel>
                        <FormControl>
                          {renderInputField(schema, field, fieldProps)}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))
              }
            </>
          )}
          <DialogFooter className="flex justify-end gap-4">
            <Button
              type="button"
              aria-keyshortcuts="Escape"
              variant={"secondary"}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddProviderDialogForm;
