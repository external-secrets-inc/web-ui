import { useTheme } from "@/components/ThemeProvider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import SettingsSection from './SettingsSection';

const formSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

type FormSchemaType = z.infer<typeof formSchema>;

const getStoredTheme = (): 'light' | 'dark' | 'system' => {
  const storedTheme = localStorage.getItem('vite-ui-theme');
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme;
  }
  return 'system';
};

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: getStoredTheme(),
    },
  });

  useEffect(() => {
    form.reset({ theme });
  }, [theme, form]);

  async function handleSave(values: FormSchemaType) {
    console.log('Appearance Settings:', values);
    setTheme(values.theme);
  }

  const subsections = [
    {
      title: 'Theme',
      content: (
        <>
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
        </>
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