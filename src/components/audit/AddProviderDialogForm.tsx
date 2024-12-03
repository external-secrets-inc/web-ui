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
import { AddProviderFieldSchema, AddProviderFormSchema, CreateProviderPayload } from './Audit.interfaces';
import useGetProvidersTypes from '@/services/audit/queries/useGetProvidersType';
import { handleDefaultApiHttpError } from '@/services/servicesHelpers';
import { Switch } from '../ui/switch';

const baseSchema = z.object({
  providerName: z.string().min(1, { message: "Name is required." }),
  providerType: z.string().min(1, { message: "Type is required." }),
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
        <div>
          <Switch
            checked={fieldProps.value == "true" ? true : fieldProps.value == "false" ? false : undefined}
            onCheckedChange={(checked) => fieldProps.onChange(checked)}
            aria-readonly
          />
        </div>
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
  const [formSchemaData, setFormSchema] = useState<AddProviderFormSchema>({});
  const [selectedFormType, setSelectedFormType] = useState<string>('');

  const { data: providersTypeData, isLoading: isLoadingProvidersTypes, isError: isErrorProvidersTypes, error: providersTypesError } = useGetProvidersTypes(true);

  useEffect(() => {
    const providersTypes = providersTypeData ?? {};
    setFormSchema(providersTypes);
  }, [providersTypeData]);

  useEffect(() => {
    if (!(providersTypesError)) return;

    handleDefaultApiHttpError(providersTypesError, "Error while fetching listener Audit data")
  }, [providersTypesError, isErrorProvidersTypes])

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

  const form = useForm<
    Record<"providerName" | "providerType" | string, string>
  >({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: {
      providerName: "",
      providerType: "",
      ...(selectedFormType
        ? Object.keys(formSchemaData[selectedFormType]).reduce<Record<string, string>>((acc, key) => {
          acc[key] = "";
          return acc;
        }, {})
        : {}
      ),
    }
  });

  const resetForm = (options?: { providerName?: string; providerType?: string }) => {
    const { providerName, providerType } = {
      providerName: options?.providerName ?? "",
      providerType: options?.providerType ?? "",
    };

    const resetValues = selectedFormType ? Object.keys(formSchemaData[selectedFormType]).reduce<Record<string, string>>((acc, key) => {
      acc[key] = "";
      return acc;
    }, {}) : {};

    form.reset({
      ...resetValues,
      providerType: providerType,
      providerName: providerName,
    });
    setSelectedFormType(providerType);
  }

  const handleFormTypeChange = (value: string) => {
    setSelectedFormType(value);
    const formValues = form.getValues(["providerName", "providerType"])
    resetForm({ providerName: formValues[0], providerType: formValues[1] })
  };

  const handleSubmit = (formValues: Record<string, string | boolean | File | number>) => {
    const { providerName, providerType, ...customFields } = formValues;

    const config = Object.entries(customFields).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "boolean") {
        acc[key] = value ? "true" : "false";
      } else if (value instanceof File) {
        acc[key] = value.name;
      } else if (typeof value === "number") {
        acc[key] = value.toString();
      } else if (typeof value === "string") {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSubmit({
      listenerID: "",
      tenantID: "",
      name: String(providerName),
      backendIdentifier: String(providerName),
      backendType: String(providerType),
      config: config,
    });
    resetForm()
  }

  const handleCancel = () => {
    onCancel();
    resetForm()
  }

  if (isLoadingProvidersTypes) {
    return <div>Loading...</div>;
  }

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
    >
      <DialogHeader>
        <DialogTitle>Add Provider</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="providerName"
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
            name="providerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormTypeChange(value);
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
                        <FormLabel className='capitalize'>{field}</FormLabel>
                        <FormControl>
                          {renderInputField(
                            schema,
                            field,
                            {
                              ...fieldProps,
                              value: fieldProps.value ?? "", // Ensure value is always defined
                            }
                          )}
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
