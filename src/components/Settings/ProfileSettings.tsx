import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
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
import { BackendUserData, IUserData } from "@/types";
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  name: z.string().min(1, { message: "Cannot be empty" }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const ProfileSettings: React.FC = () => {
  const userId = useAuthUser<IUserData>()?.userId;
  const [userData, setUserData] = useState<BackendUserData | null>(null);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        try {
          const data = await getUserData(userId);
          setUserData(data);
          form.reset({
            name: data.name,
          });
        } catch (error) {
          toast.error('Failed to load profile data');
        }
      }
    };

    fetchData();
  }, [userId]);

  // Handle Save function
  async function handleSave(values: FormSchemaType) {
    if (userData) {
      try {
        await updateUserData(userData.id, values);
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
        <>
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
          <div className='space-y-2'>
            <FormLabel>Email</FormLabel>
            { userData
              ? <p className="text-sm text-muted-foreground">{userData?.email}</p>
              : <Skeleton className='h-5 w-[stretch] max-w-48' />
            }
          </div>
        </>
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