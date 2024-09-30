import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SettingsSection from './SettingsSection';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getAccountData, updateAccountData } from '@/services/account/accountService';
import { toast } from "sonner";

const formSchema = z.object({
  contact_email: z.string().email({ message: "Invalid email address" }),
  contact_name: z.string().min(1, { message: "Cannot be empty" }),
  contact_phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const OrganizationSettings: React.FC = () => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_email: "",
      contact_name: "",
      contact_phone: "",
    },
  });

  // Fetch organization data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountData = await getAccountData();
        form.reset({
          contact_email: accountData.contact_email || "",
          contact_name: accountData.contact_name || "",
          contact_phone: accountData.contact_phone || "",
        });
      } catch (error) {
        toast.error('Failed to load organization data');
      }
    };

    fetchData();
  }, [form]);

  async function handleSave(values: FormSchemaType) {
    const dataToSend = {
      ...values,
      contact_phone: values.contact_phone || "",
    };
  
    try {
      await updateAccountData(dataToSend);
      toast.success('Organization details updated successfully');
      form.reset(values);
    } catch (error) {
      toast.error('Failed to update Organization details');
    }
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