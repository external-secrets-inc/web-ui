import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideLoader } from "lucide-react";
import NewPasswordField from "./fields/NewPasswordField";

interface SignupCredentialsStepProps {
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
  passwordRef: React.RefObject<HTMLInputElement>;
}

const SignupCredentialsStep = ({ onSubmit, onBack, loading, passwordRef }: SignupCredentialsStepProps) => {
  const { handleSubmit, control, formState: { isValid, errors } } = useFormContext();
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  const handleFormSubmit = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setSubmittedWithErrors(false);
    onSubmit(data);
  };

  const handleError = () => {
    setSubmittedWithErrors(true);
  };

  return (
    <form
      id="signup-credentials-form"
      onSubmit={handleSubmit(handleFormSubmit, handleError)}
      className="grid gap-4"
    >
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                autoFocus
                id="email"
                placeholder="you@yourcompany.com"
                autoComplete="username email"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <NewPasswordField 
        submittedWithErrors={submittedWithErrors}
        ref={passwordRef}
      />

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>

        <Button
          type="submit"
          disabled={loading || !isValid || Object.keys(errors).length > 0}
          className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
        >
          <span className={loading ? "invisible [grid-area:1/1]" : ""}>Sign Up</span>
          {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
        </Button>
      </div>
    </form>
  );
};

export default SignupCredentialsStep;
