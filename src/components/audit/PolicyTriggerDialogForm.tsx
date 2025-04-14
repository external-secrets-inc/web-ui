import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { z } from "zod";
import { PolicyTriggerTableData } from "./Audit.interfaces";

const schema = z.object({
  destinationIdentifiers: z.array(z.string()).min(1, "Select at least one destination"),
  condition: z.string().min(1, "Select a condition"),
  waitForCycles: z.coerce.number().min(0, "Must be a non-negative number"),
});

export type TriggerFormData = z.infer<typeof schema>;

const PolicyTriggerDialogForm = ({
  destinationOptions,
  conditionsOptions,
  onSubmit,
  onCancel,
}: {
  destinationOptions: { label: string; value: string }[];
  conditionsOptions: { label: string; value: string }[];
  onSubmit: (data: PolicyTriggerTableData) => void;
  onCancel: () => void;
}) => {
  const form = useForm<TriggerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationIdentifiers: [],
      condition: "",
      waitForCycles: 0,
    },
  });

  const handleSubmit = async (data: TriggerFormData) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const newTableData: PolicyTriggerTableData = {
      ...data,
      id: crypto.randomUUID(),
      waitForCycles: Number(data.waitForCycles)
    }
    onSubmit(newTableData);
    form.reset();
  };

  const handleCancel = () => {
    onCancel()
    form.reset();
  }

  return (
    <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]">
      <DialogHeader>
        <DialogTitle>Add Trigger</DialogTitle>
        <DialogDescription>Define a new trigger configuration.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="destinationIdentifiers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destinations</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={destinationOptions}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    placeholder="Select destination"
                    maxCount="auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionsOptions.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waitForCycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wait for Cycle</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              aria-keyshortcuts="Escape"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => {
                  const data = form.getValues()
                  handleSubmit(data);
                }}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </div>
      </Form>
    </DialogContent>
  );
}

export default PolicyTriggerDialogForm;
