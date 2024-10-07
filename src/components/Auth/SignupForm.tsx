import { trackSignedIn, trackSignupStepCompleted, trackSignupStepMovedBack } from "@/analytics";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginAndIdentifyUser } from "@/services/auth/authHelpers";
import { signup } from "@/services/auth/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader } from "lucide-react";
import { useRef, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm, UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { z } from "zod";
import NewPasswordField from "./fields/NewPasswordField";
import zValidations from "./fields/zValidations";

const SignupStep1Schema = z.object({
  organizationName: zValidations.organizationName,
  name: zValidations.name,
  organizationURL: zValidations.organizationURL
});

const SignupStep2Schema = z.object({
  email: zValidations.email,
  password: zValidations.newPassword
});

type SignupStep1Data = z.infer<typeof SignupStep1Schema>;
type SignupStep2Data = z.infer<typeof SignupStep2Schema>;
type SignupData = Partial<SignupStep1Data & SignupStep2Data>;

interface SignupStep1FormProps {
  form: UseFormReturn<SignupStep1Data>;
  onSubmit: (data: SignupStep1Data) => void;
}

interface SignupStep2FormProps {
  form: UseFormReturn<SignupStep2Data>;
  onSubmit: (data: SignupStep2Data) => void;
  onBack: () => void;
}

function SignupForm() {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const signupStep1Form = useForm<SignupStep1Data>({
    resolver: zodResolver(SignupStep1Schema),
    defaultValues: { organizationName: "", name: "", organizationURL: "" },
  });

  const signupStep2Form = useForm<SignupStep2Data>({
    resolver: zodResolver(SignupStep2Schema),
    defaultValues: {
      email: signupData.email || "",
      password: signupData.password || "",
    },
  });

  const handleSignupStep1Submit = (data: SignupStep1Data) => {
    setSignupData((prev) => ({ ...prev, ...data }));
    trackSignupStepCompleted(1, data.organizationName);
    setStep(2);
  };

  const handleSignupStep2Submit = async (data: SignupStep2Data) => {
    const finalData = { ...signupData, ...data };
    const maxRetries = 5;
    const retryDelay = 3000;

    try {
      setLoading(true);

      await signup(
        finalData.email!,
        finalData.name!,
        finalData.password!,
        finalData.organizationURL!,
      );

      trackSignupStepCompleted(2, finalData.organizationName);

      const tryLogin = async (attempt: number): Promise<boolean> => {
        const success = await loginAndIdentifyUser({
          email: finalData.email!,
          password: finalData.password!,
          tenantSlug: finalData.organizationURL!,
          name: finalData.name!,
          authKitSignIn,
        });
        if (success) {
          return true;
        }
        return false;
      };

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const success = await tryLogin(attempt);
          if (success) {
            trackSignedIn(finalData.organizationURL!);
            setLoading(false);
            return navigate(`/${finalData.organizationURL}/agents`);
          }
        } catch (error) {
          console.error(`Login attempt ${attempt} failed:`, error);
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      setLoading(false);
      setFormError(
        "Signup succeeded, but automatic login failed. Please try to log in manually."
      );
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      setFormError("Signup failed. Please try again.");
    }
  };

  const handleBack = () => {
    setStep(1);
    trackSignupStepMovedBack();
  };

  return (
    <>
      {step === 1 ? (
        <SignupStep1Form
          form={signupStep1Form}
          onSubmit={handleSignupStep1Submit}
        />
      ) : (
        <SignupStep2Form
          form={signupStep2Form}
          onSubmit={handleSignupStep2Submit}
          onBack={handleBack}
          loading={loading}
        />
      )}

      {!loading && formError && <div className="text-red-500">{formError}</div>}
    </>
  );
}

function SignupStep1Form({ form, onSubmit }: SignupStep1FormProps) {
  const orgURLRef = useRef<HTMLInputElement>(null);
  const [organizationURL, setOrganizationURL] = useState("");
  const [isURLManuallyEdited, setIsURLManuallyEdited] = useState(false);

  const handleOrganizationNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    form.setValue("organizationName", value);
    if (!isURLManuallyEdited) {
      let slugifiedValue = slugify(value, { lower: true, strict: true });
      slugifiedValue = slugifiedValue.replace(/[_\s]/g, "-");
      setOrganizationURL(slugifiedValue);
      form.setValue("organizationURL", slugifiedValue);
    }
  };

  const handleOrganizationURLChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsURLManuallyEdited(true);
    setOrganizationURL(e.target.value);
    form.setValue("organizationURL", e.target.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
    </Form>
  );
}

function SignupStep2Form({ form, onSubmit, onBack, loading }: SignupStep2FormProps & { loading: boolean }) {
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  const handleSubmit = (data: SignupStep2Data) => {
    setSubmittedWithErrors(false);
    onSubmit(data);
  };

  const handleError = () => {
    setSubmittedWithErrors(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleError)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  id="email"
                  placeholder="you@yourcompany.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <NewPasswordField form={form} submittedWithErrors={submittedWithErrors} />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
          >
            <span className={loading ? "invisible [grid-area:1/1]" : ""}>Sign Up</span>
            {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SignupForm;
