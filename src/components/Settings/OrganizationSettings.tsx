import { trackSignedOut } from '@/analytics';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteAccount, getAccountData, updateAccountData } from '@/services/account/accountService';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from 'react';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { z } from "zod";
import SettingsSection from './SettingsSection';

const formSchema = z.object({
  contact_email: z.string().email({ message: "Invalid email address" }),
  contact_name: z.string().min(1, { message: "Cannot be empty" }),
  contact_phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

const deleteFormSchema = (tenantId: string) => z.object({
  tenant_id: z.string().min(1, { message: "Organization URL cannot be empty" }).refine(value => value === tenantId, {
    message: "Organization URL does not match",
  }),
});

type FormSchemaType = z.infer<typeof formSchema>;
type DeleteFormSchemaType = z.infer<ReturnType<typeof deleteFormSchema>>;

const OrganizationSettings: React.FC = () => {
  const signOut = useSignOut();
  const navigate = useNavigate();

  const [accountData, setAccountData] = useState({
    contact_email: "",
    contact_name: "",
    contact_phone: "",
    tenant_id: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_email: "",
      contact_name: "",
      contact_phone: "",
    },
  });

  const deleteForm = useForm<DeleteFormSchemaType>({
    resolver: zodResolver(deleteFormSchema(accountData.tenant_id)),
    defaultValues: {
      tenant_id: "",
    },
  });

  // Fetch organization data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountData();
        setAccountData(data);
        form.reset({
          contact_email: data.contact_email || "",
          contact_name: data.contact_name || "",
          contact_phone: data.contact_phone || "",
        });
        deleteForm.reset({
          tenant_id: "",
        });
      } catch (error) {
        toast.error('Failed to load organization data');
      }
    };

    fetchData();
  }, [form, deleteForm]);

  async function handleSaveSection(values: FormSchemaType) {
    const dataToSend = {
      ...values,
      contact_phone: values.contact_phone || "",
    };

    try {
      await updateAccountData(dataToSend);
      toast.success('Organization details updated successfully');
      setAccountData((prev) => ({ ...prev, ...dataToSend }));
      form.reset(values);
    } catch (error) {
      toast.error('Failed to update Organization details');
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      toast('Organization deleted');
      setIsDeleteDialogOpen(false);
      signOut();
      trackSignedOut(false);
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete Organization');
    }
  }

  const subsections = [
    {
      title: 'Contact Information',
      content: (
        <>
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
        </>
      ),
    },
    {
      title: 'Organization Data',
      content: (
        <>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="self-end"
                variant="destructive"
              >
                Delete Organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  Deleting this Organization will permanently remove all data associated with it in our database. This action is final and cannot be undone.
                  <strong className='block mt-2'>To confirm you must type your Organization URL: <span className='text-foreground'>{accountData.tenant_id}</span></strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Form {...deleteForm}>
                <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)} className="grid gap-4">
                  <FormField
                    control={deleteForm.control}
                    name="tenant_id"
                    render={({ field }) => {
                      const { ref, ...restField } = field;
                      return (
                        <FormItem>
                          <FormLabel>Enter your Organization URL to confirm</FormLabel>
                          <FormControl>
                            <Input
                              ref={inputRef}
                              autoFocus
                              placeholder={accountData.tenant_id}
                              {...restField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      type="submit"
                      variant="destructive"
                    >
                      Delete Organization
                    </Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];

  return (
    <SettingsSection
      title="Organization"
      description="Manage your Organization settings (Admin only)"
      form={form}
      onSubmit={handleSaveSection}
      subsections={subsections}
    />
  );
};

export default OrganizationSettings;