import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SettingsSection from './SettingsSection';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

type FormSchemaType = z.infer<typeof formSchema>;

const AppearanceSettings: React.FC = () => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: 'system', // TODO: Should grab theme from local storage
    },
  });

  async function handleSave(values: FormSchemaType) {
    console.log('Appearance Settings:', values);
  }

  const subsections = [
    {
      title: 'Theme',
      content: (
        <Form {...form}>
          <form
            id="appearance-form"
            className='space-y-4'
            autoComplete="off"
            onSubmit={form.handleSubmit(handleSave)}
          >
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ),
    },
  ];

  return (
    <SettingsSection
      title="Appearance"
      description="Customize your appearance settings"
      form={form}
      onSubmit={handleSave}
      subsections={subsections}
    />
  );
};

export default AppearanceSettings;