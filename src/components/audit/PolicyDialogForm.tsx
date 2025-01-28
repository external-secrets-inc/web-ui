import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatePolicyPayload, PolicyForm } from './Audit.interfaces';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { CodeTextarea } from '@/components/ui/CodeTextarea';
import useGetValidateRule from '@/services/audit/queries/useGetValidateRule';
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useState } from "react";
import usePostValidateRule from "@/services/audit/mutations/usePostValidateRule";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const baseSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  engine: z.string().min(1, { message: "Engine is required." }),
  executeOn: z.array(z.string()).min(1, { message: "At least one action is required." }),
  rule: z.string().min(1, { message: "Rule is required." }),
});

const executeOnArray = ["Read", "Update", "Result", "Create", "Delete", "RBACCreate", "RBACUpdate", "RBACDelete"];
const executeOnOptions = executeOnArray.map(x => ({ label: x, value: x }));

const PolicyDialogForm = ({ selectedPolicyId, policyForm, onSubmit, onCancel }: {
  selectedPolicyId: string; policyForm: PolicyForm; onSubmit: (payload: CreatePolicyPayload) => void; onCancel: () => void;
}) => {
  const [isCompliant, setIsCompliant] = useState<null | boolean>(null);
  const form = useForm({ resolver: zodResolver(baseSchema), defaultValues: policyForm });

  useEffect(() => {
    form.reset(policyForm);
  }, [policyForm, form]);

  const resetForm = () => {
    form.reset(policyForm);
  }

  const handleCancel = () => {
    resetForm();
    onCancel();
  }

  const executeOn = form.watch("executeOn");
  const {
    data: sampleData,
    // isLoading: isLoadingSample, TODO: Implement loading components
    isError: isErrorSample,
    error: errorSample,
  } = useGetValidateRule(false, executeOn);

  useEffect(() => {
    const sample = sampleData ?? {};
    const isEmpty = Object.keys(sample).length === 0;
    form.setValue("sample", isEmpty ? "" : JSON.stringify(sample, null, 2));
  }, [executeOn, form, sampleData]);

  useEffect(() => {
    if (!errorSample || executeOn.length === 0) return;

    handleDefaultApiHttpError(errorSample, "Error while fetching sample data")
  }, [errorSample, isErrorSample, executeOn.length])

  const [isValidateError, setIsValidateError] = useState(false);
  const [validateErrorMessage, setValidateErrorMessage] = useState("");
  const { mutateAsync: validateRule } = usePostValidateRule(false, {
    onError: (error: AxiosError<ApiHttpError>) => {
      setIsValidateError(true);
      if(error.status == 400) {
        setValidateErrorMessage(JSON.parse(error.request.response)?.detail)
      } else {
        setValidateErrorMessage("Error while trying to validate rule")
        handleDefaultApiHttpError(error, "Error while trying to validate rule");
      }
    },
    onSuccess: (res) => setIsCompliant(res.compliant)
  });

  const name = form.watch("name");
  const rule = form.watch("rule");
  const sample = form.watch("sample");
  const performValidateRule = async () => {
    const validationPayload = { regoCode: btoa(rule), policySample: JSON.parse(sample), executeOn };
    await validateRule(validationPayload);
  };

  useEffect(() => {
    setIsCompliant(null);
    setIsValidateError(false);
  }, [executeOn, sample, rule])

  const handleSubmit = async (formValues: PolicyForm) => {
    const policyPayload = {
      tenantID: "",
      name: formValues.name,
      engine: formValues.engine,
      executeOn: formValues.executeOn,
      rule: btoa(formValues.rule),
    };

    await onSubmit(policyPayload);
    resetForm();
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
    >
      <DialogHeader>
        <DialogTitle>{selectedPolicyId ? "Edit" : "Add"} Policy</DialogTitle>
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
                  <Input disabled={Boolean(selectedPolicyId)} placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={selectedPolicyId ? undefined : field.onChange}
                    disabled={Boolean(selectedPolicyId)}
                  >
                    <SelectTrigger >
                      <SelectValue placeholder="Select the rule engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rego">Rego</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="executeOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Execute On</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={executeOnOptions}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    placeholder="Select actions"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sample"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample</FormLabel>
                <FormControl>
                  <CodeTextarea
                    language="json"
                    placeholder="Enter JSON sample"
                    className="min-h-52"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rule</FormLabel>
                <FormControl>
                  <CodeTextarea
                    language="rego"
                    placeholder="Enter Rego rule"
                    className="min-h-52"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              aria-keyshortcuts="Escape"
              variant={"secondary"}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Alert
              className={`w-full text-center text-sm mx-4 ${(isCompliant === null && !isValidateError) ? "invisible" : ""}`}
              variant={isValidateError ? "destructive" : isCompliant? "success" : "warning"}
              style={{ margin: 0, padding: 7 }}
            >
              <AlertDescription>
                {isCompliant
                  ? "This sample would be compliant!"
                  : isValidateError
                    ? validateErrorMessage
                    : "This sample would NOT be compliant!"}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={performValidateRule}
                disabled={!executeOn.length || !sample || !rule}
              >
                Validate Rule
              </Button>
              <Button
                type="submit"
                disabled={!name || !executeOn.length || !sample || !rule || isCompliant === null}
              >
                Submit
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default PolicyDialogForm;
