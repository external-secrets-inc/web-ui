import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getUserData, updateUserData } from '@/services/users/usersService';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { toast } from "sonner";
import SettingsSection from './SettingsSection';
import { IUserData } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Cannot be empty" }),
  email: z.string().email({ message: "Invalid email address" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const ProfileSettings: React.FC = () => {
  const authUser = useAuthUser<IUserData>();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (authUser?.userId) {
        try {
          const userData = await getUserData(authUser.userId);
          form.reset({
            name: userData.name,
            email: userData.email,
          });
        } catch (error) {
          toast.error('Failed to load user data');
        }
      }
    };

    fetchData();
  }, [authUser?.userId]);

  // Handle Save function
  async function handleSave(values: FormSchemaType) {
    if (authUser?.userId) {
      try {
        await updateUserData(authUser.userId, values);
        toast.success('Profile updated successfully');
        form.reset(values);
      } catch (error) {
        toast.error('Failed to update profile');
      }
    }
  }

  const subsections = [
    {
      title: 'Basics',
      content: (
        <Form {...form}>
          <form
            id="profile-form"
            className='space-y-4'
            autoComplete="off"
            onSubmit={form.handleSubmit(handleSave)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your Email"
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
      title="Profile"
      description="Manage your personal profile information"
      form={form}
      onSubmit={handleSave}
      subsections={subsections}
    />
  );
};

export default ProfileSettings;