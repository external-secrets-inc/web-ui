import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Dialog, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatePolicyPayload, PolicyForm, PolicyTriggerConditionEnum, PolicyTriggerTableData } from '@/components/Audit/Audit.interfaces';
import { EsiSelect } from '@/components/ui/EsiSelect';
import { CodeTextarea } from '@/components/ui/CodeTextarea';
import useGetValidateRule from '@/services/audit/queries/useGetValidateRule';
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { useEffect, useMemo, useState } from "react";
import usePostValidateRule from "@/services/audit/mutations/usePostValidateRule";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUDIT_QUERY_STALE_TIME, POLICY_TRIGGER_CONDITIONS_MAP } from "@/components/Audit/Audit.constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucidePlus, LucideTrash } from "lucide-react";
import { DataProvider, DataTable, defineColumns } from "@/components/ui/DataProvider";
import PolicyTriggerDialogForm from "./PolicyTriggerDialogForm";

const policyTriggerFormSchema = z.object({
  destinationIdentifiers: z.array(z.string()).min(1, "Select at least one destination"),
  condition: z.string().min(1, "Select a condition"),
  waitForCycles: z.coerce.number().min(0, "Must be a non-negative number"),
});

const baseSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  engine: z.string().min(1, { message: "Engine is required." }),
  executeOn: z.array(z.string()).min(1, { message: "At least one action is required." }),
  rule: z.string().min(1, { message: "Rule is required." }),
  triggers: z.array(policyTriggerFormSchema).optional(),
});

const executeOnArray = ["Read", "Update", "Result", "Create", "Delete", "RBACCreate", "RBACUpdate", "RBACDelete"];
const executeOnOptions = executeOnArray.map(x => ({ label: x, value: x }));

const tabValues = {
  configuration: {
    key: "configuration",
    label: "Configuration",
  },
  triggers: {
    key: "triggers",
    label: "Triggers",
  }
};

interface PolicyTriggerTableMeta {
  renderRowActions?: (row: PolicyTriggerTableData, index: number) => React.ReactNode;
}

const PolicyDialogForm = ({ selectedPolicyId, policyForm, isLoadingDestinations, destinationsMap, onSubmit, onCancel }: {
  selectedPolicyId: string;
  policyForm: PolicyForm;
  isLoadingDestinations: boolean,
  destinationsMap: Record<string, { label: string; value: string }>,
  onSubmit: (payload: CreatePolicyPayload) => void;
  onCancel: () => void;
}) => {
  const [isCompliant, setIsCompliant] = useState<null | boolean>(null);
  const form = useForm({ resolver: zodResolver(baseSchema), defaultValues: policyForm });
  const [internalTab, setInternalTab] = useState(tabValues.configuration.key);
  const [isAddTriggerDialogOpen, setIsAddTriggerDialogOpen] = useState(false);

  const onTabChange = (value: string) => {
    setInternalTab(value);
  };

  useEffect(() => {
    form.reset(policyForm);
  }, [policyForm, form]);

  const resetForm = () => {
    form.reset(policyForm);
    setInternalTab(tabValues.configuration.key)
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
  } = useGetValidateRule(false, executeOn, {
    staleTime: AUDIT_QUERY_STALE_TIME,
  });

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
      if (error.status == 400) {
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
      triggers: formValues.triggers,
    };

    await onSubmit(policyPayload);
    resetForm();
  };

  const triggerColumns = useMemo(() => defineColumns<PolicyTriggerTableData>(columnHelper => [
    columnHelper.accessor('destinationIdentifiers', {
      header: 'Destinations',
      cell: info => {
        const identifiers: string[] = info.getValue();
        return identifiers
          .map(identifier => destinationsMap[identifier]?.label || identifier)
          .join(", ");
      },
    }),
    columnHelper.accessor('condition', {
      header: 'Condition',
      cell: info => POLICY_TRIGGER_CONDITIONS_MAP[info.getValue() as PolicyTriggerConditionEnum]?.label || info.getValue(),
    }),
    columnHelper.accessor('waitForCycles', {
      header: 'Wait for Cycles',
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as PolicyTriggerTableMeta)?.renderRowActions?.(props.row.original, props.row.index)}
        </div>
      )
    })
  ]), [destinationsMap]);

  const handleAddTrigger = (newTrigger: PolicyTriggerTableData) => {
    const currentTriggers = form.getValues("triggers") || [];
    form.setValue("triggers", [...currentTriggers, newTrigger]);
    setIsAddTriggerDialogOpen(false);
  };

  const handleDeleteTrigger = (triggerIndex: number) => {
    const currentTriggers = form.getValues("triggers") || [];
    const updatedTriggers = currentTriggers.filter((_, index) => index !== triggerIndex);
    form.setValue("triggers", updatedTriggers);
  }

  const policyTriggerTableMeta: PolicyTriggerTableMeta = {
    renderRowActions: (_row, index) => (
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <LucideTrash className="w-4 h-4 mr-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-fit overflow-auto">
            <DialogHeader>
              <DialogTitle>Delete trigger</DialogTitle>
              <DialogDescription>
                This action can't be undone and will delete this trigger
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant={"destructive"} onClick={() => handleDeleteTrigger(index)}>Delete</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
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
          <Tabs
            onValueChange={onTabChange}
            value={internalTab}
            className="grid grid-rows-[auto_1fr]"
          >
            <TabsList className="mb-2 w-fit">
              {Object.entries(tabValues).map(([, { key, label }]) => (
                <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
              ))}
            </TabsList>
            <div className="relative min-h-[515px] sm:min-h-[615px] md:min-h-[715px]">
              <TabsContent className="data-[state=active]:grid min-h-0" value={tabValues.configuration.key} >
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
                        <EsiSelect
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Rule</FormLabel>
                        <Button
                          type="button"
                          onClick={performValidateRule}
                          disabled={!executeOn.length || !sample || !rule}
                          variant="secondary"
                          className="mt-2"
                        >
                          Validate Rule
                        </Button>
                      </div>
                      <FormControl>
                        <CodeTextarea
                          language="rego"
                          placeholder="Enter Rego rule"
                          className="min-h-52"
                          {...field}
                        />
                      </FormControl>
                      {(isCompliant !== null || isValidateError) && (
                        <div className="mt-4">
                          <Alert
                            className={`w-full text-center text-sm ${(isCompliant === null && !isValidateError) ? "invisible" : ""}`}
                            variant={isValidateError ? "destructive" : isCompliant ? "success" : "warning"}
                          >
                            <AlertDescription>
                              {isCompliant
                                ? "This sample would be compliant!"
                                : isValidateError
                                  ? validateErrorMessage
                                  : "This sample would NOT be compliant!"}
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent className="data-[state=active]:grid min-h-0 absolute top-0 left-0 w-full" value={tabValues.triggers.key}>
                <FormField
                  control={form.control}
                  name="triggers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triggers</FormLabel>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Configured Triggers</h4>
                        <Dialog open={isAddTriggerDialogOpen} onOpenChange={setIsAddTriggerDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isLoadingDestinations}
                            >
                              <LucidePlus className="w-4 h-4 mr-1" />
                              Add Trigger
                            </Button>
                          </DialogTrigger>
                          <PolicyTriggerDialogForm
                            destinationOptions={Object.values(destinationsMap)}
                            conditionsOptions={Object.values(POLICY_TRIGGER_CONDITIONS_MAP)}
                            onSubmit={handleAddTrigger}
                            onCancel={() => setIsAddTriggerDialogOpen(false)}
                          />
                        </Dialog>
                      </div>
                      <DataProvider
                        data={field.value ?? []}
                        columns={triggerColumns}
                        isLoading={false}
                        emptyMessage="No triggers configured"
                        initialSort={{ id: 'destinationIdentifiers', desc: false }}
                        getRowId={(_, index) => String(index)} // TODO[cfviotti]: Triggers should probably have an id from the API
                        meta={policyTriggerTableMeta}
                      >
                        <DataTable />
                      </DataProvider>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </div>
          </Tabs>
          <DialogFooter className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              aria-keyshortcuts="Escape"
              variant={"secondary"}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={!name || !executeOn.length || !sample || !rule || (isCompliant === null && !selectedPolicyId)}
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
