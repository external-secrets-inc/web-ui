import React from 'react';
import { Button } from "@/components/ui/button";
import { UseFormReturn, FormProvider } from "react-hook-form";
import { trackSettingsSectionModified } from "@/analytics";

interface Subsection {
  title: string;
  content: React.ReactNode;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  form: UseFormReturn<any>;
  onSubmit: (values: any) => void;
  subsections: Subsection[];
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, form, onSubmit, subsections }) => {
  const isDirty = form.formState.isDirty;

  // Only send values for certain sections due to sensitive data
  const sectionsToSendValues: { [key: string]: boolean } = {
    "Appearance": true,
  };

  const handleSettingsSectionFormSubmit = (values: any) => {
    if (sectionsToSendValues[title]) {
      trackSettingsSectionModified(title, values);
    } else {
      trackSettingsSectionModified(title);
    }
    onSubmit(values);
  };

  return (
    <FormProvider {...form}>
      <div className='border-b pb-6 mb-6'>
        <h2 className='text-sm font-semibold'>{title}</h2>
        <h3 className='text-sm text-muted-foreground'>{description}</h3>
      </div>
      {subsections.map((subsection, index) => (
        <section key={index} className='grid md:grid-cols-2 gap-4 mb-6'>
          <div>
            <h4 className='text-sm font-semibold'>{subsection.title}</h4>
          </div>
          <div className="flex flex-col h-full">
            {subsection.content}
          </div>
        </section>
      ))}
      <form
        id={`${title.toLowerCase()}-form`}
        className="flex gap-2 justify-end mt-6 py-4 border-t sticky bottom-0 bg-background"
        autoComplete="off"
        onSubmit={form.handleSubmit(handleSettingsSectionFormSubmit)}
      >
        {isDirty && (
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          form={`${title.toLowerCase()}-form`}
          disabled={!isDirty}
        >
          Save
        </Button>
      </form>
    </FormProvider>
  );
};

export default SettingsSection;