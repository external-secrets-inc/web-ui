import { useState, useEffect } from 'react';
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddPolicyFieldSchema, AddPolicyFieldType, AddPolicyFormSchema, CreatePolicyPayload } from './Audit.interfaces';
import useGetPoliciesTypes from '@/services/audit/queries/useGetPoliciesType';
import { handleDefaultApiHttpError } from '@/services/servicesHelpers';
import { MultiSelect } from '../ui/Multi-select';
import { Textarea } from '../ui/textarea';
// import useGetValidateRule from '@/services/audit/queries/useGetValidateRule';

const baseSchema = z.object({
  policyName: z.string().min(1, { message: "Name is required." }),
  policyEngine: z.string().min(1, { message: "Engine is required." }),
});

const executeOnArray = ["Read", "UpdatePreHash", "UpdatePostHash", "Create", "Delete", "RBACCreate", "RBACUpdate", "RBACDelete", "*"];
const executeOnOptions = executeOnArray.map(x => ({ label: x, value: x }));

const fieldHandlers: Record<
  AddPolicyFieldType,
  {
    generateSchema: (key: string, schema: AddPolicyFieldSchema) => z.ZodType;
    render: (
      schema: AddPolicyFieldSchema,
      field: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fieldProps: ControllerRenderProps<Record<string, any>, any>
    ) => JSX.Element | null;
  }
> = {
  string: {
    generateSchema: (key, schema) =>
      schema.required
        ? z.string().min(1, { message: `${key} is required.` }).max(schema.maxLength || Infinity)
        : z.string().max(schema.maxLength || Infinity).optional(),
    render: (schema, field, fieldProps) => (
      <Input
        placeholder={`Enter ${field}`}
        maxLength={schema.maxLength}
        {...fieldProps}
      />
    ),
  },
  strArray: {
    generateSchema: (key, schema) =>
      schema.required
        ? z
          .array(z.string().min(1, { message: `${key} items must not be empty.` }))
        : z
          .array(z.string())
          .optional(),
    render: (_, field, fieldProps) => (
      <MultiSelect
        options={executeOnOptions}
        onValueChange={(value: string[]) => fieldProps.onChange(value)}
        defaultValue={Array.isArray(fieldProps.value) ? fieldProps.value : []}
        placeholder={`Enter ${field}`}
      />
    ),
  },
  textArea: {
    generateSchema: (key, schema) =>
      schema.required
        ? z.string().min(1, { message: `${key} is required.` }).max(schema.maxLength || Infinity)
        : z.string().max(schema.maxLength || Infinity).optional(),
    render: (schema, field, fieldProps) => (
      <Textarea
        placeholder={`Enter ${field}`}
        maxLength={schema.maxLength}
        {...fieldProps}
      />
    ),
  },
};

const renderInputField = (
  schema: AddPolicyFieldSchema,
  field: string,
  fieldProps: ControllerRenderProps<Record<string, string>, string>
): JSX.Element | null => {
  const handler = fieldHandlers[schema.type];
  return handler ? handler.render(schema, field, fieldProps) : null;
};

const AddPolicyDialogForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: CreatePolicyPayload) => void;
  onCancel: () => void;
}) => {
  const [formSchemaData, setFormSchema] = useState<AddPolicyFormSchema>({});
  const [selectedFormType, setSelectedFormType] = useState<string>('');

  const {
    data: policiesTypeData,
    isLoading: isLoadingPoliciesTypes,
    isError: isErrorPoliciesTypes,
    error: policiesTypesError
  } = useGetPoliciesTypes(true);

  useEffect(() => {
    const policiesTypes = policiesTypeData ?? {};
    setFormSchema(policiesTypes);
  }, [policiesTypeData]);

  useEffect(() => {
    if (!(policiesTypesError)) return;

    handleDefaultApiHttpError(policiesTypesError, "Error while fetching policies Audit data")
  }, [policiesTypesError, isErrorPoliciesTypes])

  const generateZodSchema = (formType: string): z.ZodObject<Record<string, z.ZodType>> => {
    const fields = formSchemaData[formType];
    const dynamicSchema = Object.entries(fields).reduce<Record<string, z.ZodType>>(
      (acc, [key, schema]) => {
        const handler = fieldHandlers[schema.type];
        if (handler) {
          acc[key] = handler.generateSchema(key, schema);
        } else {
          acc[key] = z.unknown(); // Fallback for unsupported types
        }
        return acc;
      },
      {}
    );

    return baseSchema.merge(z.object(dynamicSchema));
  };

  const formSchema = selectedFormType ? generateZodSchema(selectedFormType) : baseSchema;

  const form = useForm<
    Record<"policyName" | "policyEngine" | string, string>
  >({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: {
      policyName: "",
      policyEngine: "",
      ...(selectedFormType
        ? Object.keys(formSchemaData[selectedFormType]).reduce<Record<string, string>>((acc, key) => {
          acc[key] = "";
          return acc;
        }, {})
        : {}
      ),
    }
  });

  const resetForm = (options?: { policyName?: string; policyEngine?: string }) => {
    const { policyName, policyEngine } = {
      policyName: options?.policyName ?? "",
      policyEngine: options?.policyEngine ?? "",
    };

    const resetValues = selectedFormType ? Object.keys(formSchemaData[selectedFormType]).reduce<Record<string, string>>((acc, key) => {
      acc[key] = "";
      return acc;
    }, {}) : {};

    form.reset({
      ...resetValues,
      policyEngine: policyEngine,
      policyName: policyName,
    });
    setSelectedFormType(policyEngine);
  }

  const handleFormTypeChange = (value: string) => {
    setSelectedFormType(value);
    const formValues = form.getValues(["policyName", "policyEngine"])
    resetForm({ policyName: formValues[0], policyEngine: formValues[1] })
  };

  const handleSubmit = (formValues: Record<string, string | string[]>) => {
    const { policyName, policyEngine, ...customFields } = formValues;

    if (policyEngine === "rego" && Array.isArray(customFields.executeOn) && typeof customFields.rule === "string") {
      onSubmit({
        tenantID: "",
        name: String(policyName),
        engine: "rego",
        executeOn: customFields.executeOn,
        rule: customFields.rule,
      });
      resetForm()
    }
  }

  const handleCancel = () => {
    onCancel();
    resetForm()
  }

  // const formFields = form.getValues();
  // const executeOn = formFields.executeOn;
  // const {
  //   data: sampleData,
  //   isLoading: isLoadingSample,
  //   isError: isErrorSample,
  //   error: errorSample,
  // } = useGetValidateRule(executeOn.map(x => x.value));

  // useEffect(() => {
  //   const sample = sampleData ?? {};
  //   form.setValue("sample", JSON.stringify(sample));
  // }, [formFields]);

  // useEffect(() => {
  //   if (!(errorSample)) return;

  //   handleDefaultApiHttpError(errorSample, "Error while fetching sample data")
  // }, [errorSample, isErrorSample])


  if (isLoadingPoliciesTypes) {
    return <div>Loading...</div>;
  }

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
    >
      <DialogHeader>
        <DialogTitle>Add Policy</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="policyName"
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
            name="policyEngine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFormTypeChange(value);
                    }}
                  >
                    <SelectTrigger >
                      <SelectValue placeholder="Select the rule engine" />
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

export default AddPolicyDialogForm;
