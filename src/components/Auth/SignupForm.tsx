import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import slugify from "slugify";
import { SquareIcon, CheckSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const SignupStep1Schema = z.object({
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
});

const SignupStep2Schema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string()
    .min(12, "Password must be at least 12 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),
});

type SignupStep1Data = z.infer<typeof SignupStep1Schema>;
type SignupStep2Data = z.infer<typeof SignupStep2Schema>;
type SignupData = Partial<SignupStep1Data & SignupStep2Data>;

interface SignupFormProps {
  onSubmit: (data: SignupData) => void;
}

interface SignupStep1FormProps {
  form: UseFormReturn<SignupStep1Data>;
  onSubmit: (data: SignupStep1Data) => void;
}

interface SignupStep2FormProps {
  form: UseFormReturn<SignupStep2Data>;
  onSubmit: (data: SignupStep2Data) => void;
  onBack: () => void;
}

function SignupForm({ onSubmit }: SignupFormProps) {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({});

  const signupStep1Form = useForm<SignupStep1Data>({
    resolver: zodResolver(SignupStep1Schema),
    defaultValues: { workspaceName: "", name: "" },
  });

  const signupStep2Form = useForm<SignupStep2Data>({
    resolver: zodResolver(SignupStep2Schema),
    defaultValues: { email: signupData.email || "", password: signupData.password || "" },
  });

  const handleSignupStep1Submit = (data: SignupStep1Data) => {
    setSignupData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleSignupStep2Submit = (data: SignupStep2Data) => {
    const slugOptions = {
      lower: true,
      strict: true, // Remove characters that are not in the regex
      replacement: '-', // Replace spaces with hyphens
      remove: /[^a-zA-Z0-9-_ ]/g, // Remove characters that do not match the regex, allowing spaces
    };
    const slugifiedWorkspaceName = slugify(signupData.workspaceName || "", slugOptions);
    const finalData = { ...signupData, ...data, organization: slugifiedWorkspaceName };
    onSubmit(finalData);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <>
      {step === 1 ? (
        <SignupStep1Form form={signupStep1Form} onSubmit={handleSignupStep1Submit} />
      ) : (
        <SignupStep2Form form={signupStep2Form} onSubmit={handleSignupStep2Submit} onBack={handleBack} />
      )}
    </>
  );
}

function SignupStep1Form({ form, onSubmit }: SignupStep1FormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="workspaceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input id="workspaceName" placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Full Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Next
        </Button>
      </form>
    </Form>
  );
}

function SignupStep2Form({ form, onSubmit, onBack }: SignupStep2FormProps) {
  const [password, setPassword] = useState(form.getValues("password"));
  const [passwordValidations, setPasswordValidations] = useState({
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^a-zA-Z0-9]/.test(password),
  });
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  useEffect(() => {
    setPasswordValidations({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^a-zA-Z0-9]/.test(password),
    });
  }, [password]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    form.setValue("password", value);
  };

  const handleSubmit = (data: SignupStep2Data) => {
    setSubmittedWithErrors(false);
    onSubmit(data);
  };

  const handleError = () => {
    setSubmittedWithErrors(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input id="email" placeholder="you@yourcompany.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  {...field}
                  value={password}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <ul className="mt-2 text-sm text-muted-foreground">
                <li className={`flex items-center ${submittedWithErrors && !passwordValidations.length ? "text-red-500" : ""}`}>
                  {passwordValidations.length ? <CheckSquareIcon className="mr-2 text-green-500" /> : <SquareIcon className="mr-2" />}
                  At least 12 characters
                </li>
                <li className={`flex items-center ${submittedWithErrors && !passwordValidations.uppercase ? "text-red-500" : ""}`}>
                  {passwordValidations.uppercase ? <CheckSquareIcon className="mr-2 text-green-500" /> : <SquareIcon className="mr-2" />}
                  At least one uppercase letter
                </li>
                <li className={`flex items-center ${submittedWithErrors && !passwordValidations.number ? "text-red-500" : ""}`}>
                  {passwordValidations.number ? <CheckSquareIcon className="mr-2 text-green-500" /> : <SquareIcon className="mr-2" />}
                  At least one number
                </li>
                <li className={`flex items-center ${submittedWithErrors && !passwordValidations.specialChar ? "text-red-500" : ""}`}>
                  {passwordValidations.specialChar ? <CheckSquareIcon className="mr-2 text-green-500" /> : <SquareIcon className="mr-2" />}
                  At least one special character
                </li>
              </ul>
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">
            Sign Up
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SignupForm;