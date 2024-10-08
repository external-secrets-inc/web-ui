import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import slugify from "slugify";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SignupOrganizationInfoStep = ({ onSubmit }: { onSubmit: () => void }) => {
  const { handleSubmit, setValue, control } = useFormContext();
  const orgURLRef = useRef<HTMLInputElement>(null);
  const [organizationURL, setOrganizationURL] = useState("");
  const [isURLManuallyEdited, setIsURLManuallyEdited] = useState(false);

  const handleOrganizationNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setValue("organizationName", value);
    if (!isURLManuallyEdited) {
      let slugifiedValue = slugify(value, { lower: true, strict: true });
      slugifiedValue = slugifiedValue.replace(/[_\s]/g, "-");
      setOrganizationURL(slugifiedValue);
      setValue("organizationURL", slugifiedValue);
    }
  };

  const handleOrganizationURLChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsURLManuallyEdited(true);
    setOrganizationURL(e.target.value);
    setValue("organizationURL", e.target.value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Full Name</FormLabel>
            <FormControl>
              <Input autoFocus id="name" placeholder="Jane Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Name</FormLabel>
            <FormControl>
              <Input
                id="organizationName"
                placeholder="Acme Inc."
                {...field}
                onChange={handleOrganizationNameChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="organizationURL"
        render={({ field }) => {
          const { onChange, ...restField } = field;
          return (
            <FormItem>
              <FormLabel>Create an Organization URL</FormLabel>
              <FormControl>
                <div
                  onClick={() => orgURLRef.current?.focus()}
                  className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                >
                  <span className="pl-3 text-sm text-muted-foreground/50">
                    app.externalsecrets.com/
                  </span>
                  <Input
                    ref={orgURLRef}
                    className="border-none pl-0 focus-visible:ring-0"
                    id="organizationURL"
                    placeholder="acme-inc"
                    value={organizationURL}
                    onChange={(e) => {
                      handleOrganizationURLChange(e);
                      onChange(e);
                    }}
                    {...restField}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Button type="submit" className="w-full">
        Next
      </Button>
    </form>
  );
};

export default SignupOrganizationInfoStep;