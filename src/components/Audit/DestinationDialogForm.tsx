import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateDestinationPayload, EditDestinationPayload, DestinationsWebhookConfig } from './Audit.interfaces';
import { toast } from "sonner";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import useCreateDestination from "@/services/audit/mutations/useCreateDestination";
import useEditDestination from "@/services/audit/mutations/useEditDestination";
import useGetDestinationTypes, { DestinationTypeField } from "@/services/audit/queries/useGetDestinationTypes";
import useGetDestination from "@/services/audit/queries/useGetDestination";
import { Loader } from "@/components/ui/Loader";
import { Separator } from "@/components/ui/separator";
import { createSlug, isValidSlug } from "@/utils/slugify";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideAlertCircle } from "lucide-react";

// Flattened form state interface
interface DestinationFormValues {
  name: string;
  identifier: string;
  type: string;
  [key: string]: string | undefined | boolean | number;
}

// Update props to accept destinationID
interface DestinationDialogFormProps {
  destinationID?: string; // Use ID for fetching
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

export const DestinationDialogForm = ({ destinationID, onSuccess, onCancel }: DestinationDialogFormProps) => {
  const isEditing = Boolean(destinationID);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: fetchedDestination,
    isLoading: isLoadingDestination,
    isError: isErrorDestination,
    error: destinationError,
    isFetching: isFetchingDestination,
  } = useGetDestination(destinationID);

  const { data: destinationTypes, isLoading: isLoadingTypes } = useGetDestinationTypes();

  const initialType = useMemo(() => fetchedDestination?.type || "", [fetchedDestination]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [isIdentifierManuallyEdited, setIsIdentifierManuallyEdited] = useState(isEditing);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const dynamicSchema = useMemo(() => {
    return createDynamicSchema(destinationTypes?.[selectedType]);
  }, [destinationTypes, selectedType]);

  const defaultValues = useMemo(() => {
    const destination = fetchedDestination;

    const baseDefaults = {
      name: destination?.name || "",
      identifier: destination?.identifier || "",
      type: initialType,
    };

    let configDefaults: Record<string, string> = {};

    if (isEditing && destination?.config && initialType && destinationTypes?.[initialType]) {
      // Map existing config using labels for edit mode
      // TODO[cfviotti]: Ideally, API schema/data structure would align keys/labels to avoid this manual mapping.
      const typeFields = destinationTypes[initialType];
      typeFields.forEach((fieldSchema) => {
        const label = fieldSchema.label;

        let value: string | undefined;

        // Map specific known config fields; extend if new config structures are added
        if (label === "URL") { value = String(destination.config.url ?? ""); }
        else if (label === "CA Bundle") { value = String(destination.config.caBundle ?? ""); }
        else if (label === "Auth method") { value = String(destination.config.auth ?? ""); }
        else if (label === "Event Format") { value = String(destination.config.format ?? ""); }

        configDefaults[label] = value ?? fieldSchema.default ?? "";
      });
    } else if (!isEditing && selectedType && destinationTypes?.[selectedType]) {
      // Use schema defaults when creating and type is selected
      const typeFields = destinationTypes[selectedType];
      configDefaults = typeFields.reduce((acc, fieldSchema) => {
        const isEnum = (fieldSchema.type === "enum" || fieldSchema.type === "string[]") && fieldSchema.values && fieldSchema.values.length > 0;
        // Set default for required enums to the first option if no explicit default is provided
        if (fieldSchema.required && isEnum && !fieldSchema.default && fieldSchema.values && fieldSchema.values.length > 0) {
          acc[fieldSchema.label] = fieldSchema.values[0];
        } else {
          acc[fieldSchema.label] = fieldSchema.default ?? "";
        }
        return acc;
      }, {} as Record<string, string>);
    }
    return { ...baseDefaults, ...configDefaults };

  }, [isEditing, fetchedDestination, initialType, selectedType, destinationTypes]);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (isEditing && fetchedDestination) {
      if (!isFetchingDestination) {
        form.reset(defaultValues);
      }
    }
  }, [isEditing, fetchedDestination, form, defaultValues, isFetchingDestination]);

  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && !isIdentifierManuallyEdited) {
      const trimmedName = watchedName.trim();
      if (trimmedName) {
        form.setValue("identifier", createSlug(trimmedName));
      }
    }
  }, [watchedName, isIdentifierManuallyEdited, isEditing, form]);

  const watchedType = form.watch("type");
  useEffect(() => {
    if (watchedType !== selectedType) {
      setSelectedType(watchedType);
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

  const { mutateAsync: editMutateAsync } = useEditDestination();

  const onSubmit = async (data: DestinationFormValues) => {
    setIsSubmitting(true);
    setFormError(null);

    const { name, identifier, type, ...dynamicFields } = data;

    const configPayload: DestinationsWebhookConfig = {
      url: String(dynamicFields["URL"] ?? ""),
      caBundle: String(dynamicFields["CA Bundle"] ?? ""),
      auth: (dynamicFields["Auth method"] ?? "NONE") as DestinationsWebhookConfig['auth'],
      format: (dynamicFields["Event Format"] ?? "CLOUD_EVENTS") as DestinationsWebhookConfig['format'],
    };
    const submissionType = type;

    try {
      const basePayload = {
        name: name,
        type: submissionType,
        config: configPayload,
      };

      if (isEditing && destinationID) {
        const editPayload: EditDestinationPayload = { ...basePayload };
        await editMutateAsync({ destinationID: destinationID, payload: editPayload });

        await queryClient.invalidateQueries({ queryKey: ["audit", "useGetDestinations"] });
        await queryClient.invalidateQueries({ queryKey: ["audit", "useGetDestination", destinationID], refetchType: 'none' });

        toast.success("Destination updated successfully");

        setIsSubmitting(false);
        onSuccess();

      } else {
        const createPayload: CreateDestinationPayload = { ...basePayload, identifier: identifier };
        createMutate(createPayload);
      }
    } catch (error) {
      toast.error("Error during submission");
      handleDefaultApiHttpError(error as AxiosError<ApiHttpError>, "Error during submission");
      setFormError("Failed to save changes.");
      setIsSubmitting(false);
    }
  };

  const availableTypes = useMemo(() => {
    if (!destinationTypes) return [];
    return Object.keys(destinationTypes);
  }, [destinationTypes]);

  if (isEditing && isLoadingDestination) {
    return (
      <DialogContent className="flex items-center justify-center p-8">
        <Loader size="lg" />
      </DialogContent>
    );
  }

  if (isEditing && isErrorDestination) {
    return (
      <DialogContent>
        <Alert variant="destructive">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Destination</AlertTitle>
          <AlertDescription>
            {destinationError?.message || "Could not load destination details. Please try again."}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Close</Button>
        </DialogFooter>
      </DialogContent>
    );
  }

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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Destination" : "Add Destination"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update the destination configuration." : "Configure a new destination for audit triggers."}
        </DialogDescription>
      </DialogHeader>

      {isLoadingTypes && !isEditing && (
        <div className="flex items-center justify-center p-4"><Loader /></div>
      )}

      {(!isLoadingTypes || (isEditing && fetchedDestination)) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        if (!isEditing && !isIdentifierManuallyEdited) {
                          form.setValue("identifier", createSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={isEditing}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          setIsIdentifierManuallyEdited(true);
                        }
                      }}
                    />
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
                  {isLoadingTypes && !isEditing ? (
                    <Loader />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedType(value);
                      }}
                      value={field.value}
                      disabled={isEditing}
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
                        {isEditing && fetchedDestination && !availableTypes.includes(fetchedDestination.type) && (
                          <SelectItem key={fetchedDestination.type} value={fetchedDestination.type} disabled>
                            {fetchedDestination.type}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && destinationTypes?.[selectedType] && renderConfigFields(destinationTypes[selectedType])}

            {formError && (
              <div className="text-sm text-red-500">
                {formError}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (isEditing && !form.formState.isDirty)}>
                {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  );
};