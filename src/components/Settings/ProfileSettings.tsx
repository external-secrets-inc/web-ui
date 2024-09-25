import React from 'react';
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
import SettingsSection from './SettingsSection';

const formSchema = z.object({
  name: z.string().min(1, { message: "Cannot be empty" }),
  email: z.string().email({ message: "Invalid email address" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const ProfileSettings: React.FC = () => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", // TODO: Grab user's name from the API
      email: "", // TODO: Grab user's email from the API
    },
  });

  async function handleSave(values: FormSchemaType) {
    console.log('Name:', values.name);
    console.log('Email:', values.email);
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