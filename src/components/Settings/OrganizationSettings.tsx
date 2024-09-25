import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SettingsSection from './SettingsSection';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  contact_email: z.string().email({ message: "Invalid email address" }),
  contact_name: z.string().min(1, { message: "Cannot be empty" }),
  contact_phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }), // TODO: Find out how to apply mask
});

type FormSchemaType = z.infer<typeof formSchema>;

const OrganizationSettings: React.FC = () => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_email: "", // TODO: Grab user's email from the API
      contact_name: "", // TODO: Grab user's name from the API
      contact_phone: "", // TODO: Grab user's phone from the API
    },
  });

  async function handleSave(values: FormSchemaType) {
    // TODO: Handle form submission with API
    console.log('Organization Settings:', values);
  }

  const subsections = [
    {
      title: 'Contact Information',
      content: (
        <Form {...form}>
          <form
            id="organization-form"
            className='space-y-4'
            autoComplete="off"
            onSubmit={form.handleSubmit(handleSave)}
          >
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 123-456-7890"
                      {...field}
                    />
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
      title="Organization"
      description="Manage your Organization settings (Admin only)"
      form={form}
      onSubmit={handleSave}
      subsections={subsections}
    />
  );
};

export default OrganizationSettings;