import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DestinationTableData, CreateDestinationPayload, EditDestinationPayload, DestinationsWebhookConfig } from './Audit.interfaces';
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import useCreateDestination from "@/services/audit/mutations/useCreateDestination";
import useEditDestination from "@/services/audit/mutations/useEditDestination";
import useGetDestinationTypes, { DestinationTypeField } from "@/services/audit/queries/useGetDestinationTypes";
import { Loader } from "@/components/ui/Loader";
import { Separator } from "@/components/ui/separator";
import { createSlug, isValidSlug } from "@/utils/slugify";

// Flattened form state interface
interface DestinationFormValues {
  name: string;
  identifier: string;
  type: string;
  // Dynamic fields will be added here directly
  [key: string]: string | undefined | boolean | number; // Allow dynamic fields
}

interface DestinationDialogFormProps {
  destination?: DestinationTableData;
  onSuccess: () => void;
  onCancel: () => void;
}

// Base schema for static fields
const baseSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  identifier: z.string()
    .min(1, { message: "Identifier is required." })
    .refine((val) => isValidSlug(val), {
      message: "Identifier must contain only lowercase letters, numbers, hyphens, and underscores."
    }),
  type: z.string().min(1, { message: "Type is required." }),
});

// Function to create Zod schema dynamically, merging with base
const createDynamicSchema = (typeFields: DestinationTypeField[] | undefined) => {
  const dynamicPart: Record<string, z.ZodType> = {};

  if (typeFields) {
    typeFields.forEach((fieldSchema) => {
      const fieldLabel = fieldSchema.label;
      let fieldZodSchema: z.ZodType;
      const isEnum = (fieldSchema.type === "enum" || fieldSchema.type === "string[]") && fieldSchema.values && fieldSchema.values.length > 0;

      if (isEnum) {
        fieldZodSchema = z.enum(fieldSchema.values as [string, ...string[]]);
      } else {
        switch (fieldSchema.type) {
          case "boolean":
            fieldZodSchema = z.string().transform(val => val === 'true').pipe(z.boolean());
            break;
          case "number":
            fieldZodSchema = z.string().transform(val => parseFloat(val)).pipe(z.number());
            break;
          default:
            fieldZodSchema = z.string();
        }
      }

      if (fieldSchema.required) {
        if (isEnum) {
          fieldZodSchema = (fieldZodSchema as z.ZodEnum<[string, ...string[]]>).refine(val => val !== undefined && val !== null && val !== "", {
            message: `${fieldLabel} is required.`
          });
        } else if (fieldSchema.type === 'string') {
           fieldZodSchema = (fieldZodSchema as z.ZodString).min(1, { message: `${fieldLabel} is required.` });
        } else {
             fieldZodSchema = fieldZodSchema.refine(val => val !== undefined && val !== null, {
                 message: `${fieldLabel} is required.`
             });
        }
      } else {
        fieldZodSchema = fieldZodSchema.optional().nullable();
      }

      dynamicPart[fieldLabel] = fieldZodSchema;
    });
  }
  // Merge base schema with the dynamic part
  return baseSchema.merge(z.object(dynamicPart));
};

export const DestinationDialogForm = ({ destination, onSuccess, onCancel }: DestinationDialogFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialType = destination?.type || "";
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [isIdentifierManuallyEdited, setIsIdentifierManuallyEdited] = useState(!!destination);

  const { data: destinationTypes, isLoading: isLoadingTypes } = useGetDestinationTypes();

  // Calculate the dynamic part of the schema based on the selected type
  const dynamicSchema = useMemo(() => {
    return createDynamicSchema(destinationTypes?.[selectedType]);
  }, [destinationTypes, selectedType]);

  // Calculate default values in a flat structure
  const defaultValues = useMemo(() => {
    const baseDefaults = {
        name: destination?.name || "",
        identifier: destination?.identifier || "",
        type: initialType,
    };

    let configDefaults: Record<string, string> = {};
    if (destination?.config) {
      configDefaults = Object.entries(destination.config).reduce((acc, [key, value]) => {
        acc[key] = String(value ?? "");
        return acc;
      }, {} as Record<string, string>);
    } else if (selectedType && destinationTypes?.[selectedType]) {
      const typeFields = destinationTypes[selectedType];
      configDefaults = typeFields.reduce((acc, fieldSchema) => {
        const isEnum = (fieldSchema.type === "enum" || fieldSchema.type === "string[]") && fieldSchema.values && fieldSchema.values.length > 0;
        if (fieldSchema.required && isEnum && !fieldSchema.default && fieldSchema.values && fieldSchema.values.length > 0) {
          acc[fieldSchema.label] = fieldSchema.values[0];
        } else {
          acc[fieldSchema.label] = fieldSchema.default ?? "";
        }
        return acc;
      }, {} as Record<string, string>);
    }
    // Merge base defaults with dynamic config defaults
    return { ...baseDefaults, ...configDefaults };

  }, [destination, initialType, selectedType, destinationTypes]);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  });

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!destination && !isIdentifierManuallyEdited) {
      const trimmedName = watchedName.trim();
      if (trimmedName) {
        form.setValue("identifier", createSlug(trimmedName));
      }
    }
  }, [watchedName, isIdentifierManuallyEdited, destination, form]);

  const watchedType = form.watch("type");
  useEffect(() => {
    // Update selected type state when form value changes
    if (watchedType !== selectedType) {
      setSelectedType(watchedType);
      // Default values and schema will recalculate via useMemo, and form will reset via useEffect
    }
  }, [watchedType, selectedType]);

  const { mutate: createMutate } = useCreateDestination({
    onError: (error: AxiosError<ApiHttpError>) => {
        handleDefaultApiHttpError(error, "Error while trying to create destination");
        setIsSubmitting(false);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      onSuccess();
    },
  });

  const { mutate: editMutate } = useEditDestination({
    onError: (error: AxiosError<ApiHttpError>) => {
        handleDefaultApiHttpError(error, "Error while trying to edit destination");
        setIsSubmitting(false);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      onSuccess();
    },
  });

  // Use the validated flat data structure
  const onSubmit = async (data: DestinationFormValues) => {
    setIsSubmitting(true);
    setError(null);

    // Extract base fields and gather dynamic fields into config
    const { name, identifier, type, ...dynamicFields } = data;

    // Construct config payload ensuring keys match DestinationsWebhookConfig
    const configPayload: DestinationsWebhookConfig = {
      url: String(dynamicFields["URL"] ?? ""), // Use the exact label from API response
      caBundle: String(dynamicFields["CA Bundle"] ?? ""), // Use the exact label
      auth: (dynamicFields["Auth method"] ?? "NONE") as DestinationsWebhookConfig['auth'], // Use the exact label
      format: (dynamicFields["Event Format"] ?? "CLOUD_EVENTS") as DestinationsWebhookConfig['format'], // Use the exact label
    };
    const submissionType = type; // Type is directly from validated data

    try {
      const basePayload = {
        name: name,
        type: submissionType,
        config: configPayload,
      };

      if (destination) {
        const editPayload: EditDestinationPayload = {
          ...basePayload,
        };
        editMutate({
          destinationID: destination.destinationID,
          payload: editPayload
        });
      } else {
        const createPayload: CreateDestinationPayload = {
          ...basePayload,
          identifier: identifier,
        };
        createMutate(createPayload);
      }
    } catch (error) {
      console.error("Client-side error during submission:", error);
      setError("An unexpected client-side error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  const renderConfigFields = (fieldsSchema: DestinationTypeField[]) => {
    if (!fieldsSchema || fieldsSchema.length === 0) return null;

    return (
      <div className="space-y-4">
        <Separator />
        <h3 className="text-sm font-medium">Configuration</h3>
        {fieldsSchema.map((fieldSchema) => {
          const fieldLabel = fieldSchema.label;
          const isEnum = (fieldSchema.type === "enum" || fieldSchema.type === "string[]") && fieldSchema.values && fieldSchema.values.length > 0;
          const options = isEnum ? fieldSchema.values || [] : [];

          return (
            <FormField
              key={fieldLabel}
              control={form.control}
              // Use label directly as field name (top-level)
              name={fieldLabel}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>
                    {fieldLabel}
                  </FormLabel>
                  <FormControl>
                    {isEnum ? (
                      <Select
                        onValueChange={formField.onChange}
                        value={String(formField.value ?? fieldSchema.default ?? "")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${fieldLabel}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={`Enter ${fieldLabel}`}
                        value={String(formField.value ?? fieldSchema.default ?? "")}
                        onChange={(e) => formField.onChange(e.target.value)}
                        onBlur={formField.onBlur}
                        name={formField.name}
                        ref={formField.ref}
                        type={fieldSchema.type === 'number' ? 'number' : 'text'}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    );
  };

  const availableTypes = useMemo(() => {
    if (!destinationTypes) return [];
    return Object.keys(destinationTypes);
  }, [destinationTypes]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{destination ? "Edit Destination" : "Add Destination"}</DialogTitle>
        <DialogDescription>
          {destination ? "Update the destination configuration." : "Configure a new destination for audit triggers."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter destination name"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!destination && !isIdentifierManuallyEdited) {
                        form.setValue("identifier", createSlug(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identifier Field */}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter unique identifier"
                    {...field}
                    disabled={!!destination}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!destination) {
                        setIsIdentifierManuallyEdited(true);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type Field */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                {isLoadingTypes ? (
                  <Loader />
                ) : (
                  <Select
                    onValueChange={(value) => {
                       field.onChange(value); // Update RHF state
                       setSelectedType(value); // Update local state used for schema/defaults
                    }}
                    value={field.value}
                    disabled={!!destination}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      {destination && !availableTypes.includes(destination.type) && (
                         <SelectItem key={destination.type} value={destination.type} disabled>
                           {destination.type}
                         </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Render dynamic fields based on selectedType from *state* */}
          {selectedType && destinationTypes?.[selectedType] && renderConfigFields(destinationTypes[selectedType])}

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Dialog Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : destination ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};