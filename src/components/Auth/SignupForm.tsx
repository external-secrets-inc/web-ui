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
import { login, signup } from "@/services/auth/authService";
import { getUserData } from "@/services/users/usersService";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquareIcon, LucideLoader, SquareIcon, } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm, UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { z } from "zod";

const SignupStep1Schema = z.object({
  organizationName: z
    .string()
    .min(1, "Cannot be empty"),
  name: z.string().min(1, "Cannot be empty"),
  organizationURL: z
    .string()
    .min(1, "Cannot be empty.")
    .regex(/^[a-zA-Z0-9-]+$/, "Organization URL may only contain letters, numbers, and dashes."),
});

const SignupStep2Schema = z.object({
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character."
    ),
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
    setStep(2);
  };

  const handleSignupStep2Submit = async (data: SignupStep2Data) => {
    const finalData = { ...signupData, ...data };
    const maxRetries = 5;
    const retryDelay = 3000;

    try {
      await signup(
        finalData.email!,
        finalData.name!,
        finalData.password!,
        finalData.organizationURL!,
      );

      const tryLogin = async (attempt: number): Promise<boolean> => {
        try {
          const { token, tenantId, tenant, userId } = await login(
            finalData.email!,
            finalData.password!,
            finalData.organizationURL!,
            { suppressToast: true }
          );

          // TODO: Create a UserProvider to share user data across the application and eliminate duplicated code in LoginForm, SignUpForm and Verify components
          // https://github.com/external-secrets-inc/web-ui/issues/60
          const userDetails = await getUserData(userId!, { manualToken: token });
          const isSignedIn = authKitSignIn({
            auth: {
              token,
              type: "Bearer",
            },
            userState: {
              email: finalData.email,
              organizationURL: finalData.organizationURL,
              name: userDetails.name,
              isActive: userDetails.is_active,
              tenantId,
              tenant,
              userId,
            },
          });

          if (isSignedIn) return true;

          return false;
        } catch (error) {
          console.error(`Login attempt ${attempt} failed:`, error);
          return false;
        }
      };

      setLoading(true);
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const success = await tryLogin(attempt);
        if (success) {
          setLoading(false);
          return navigate(`/${finalData.organizationURL}/agents`);
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      setLoading(false);
      setFormError(
        "Signup succeeded, but automatic login failed. Please try to log in manually."
      );
    } catch {
      setLoading(false);
      setFormError("Signup failed. Please try again.");
    }
  };

  const handleBack = () => {
    setStep(1);
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
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.uppercase
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {passwordValidations.uppercase ? (
                    <CheckSquareIcon className="mr-2 text-green-500" />
                  ) : (
                    <SquareIcon className="mr-2" />
                  )}
                  At least one uppercase letter
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.number
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {passwordValidations.number ? (
                    <CheckSquareIcon className="mr-2 text-green-500" />
                  ) : (
                    <SquareIcon className="mr-2" />
                  )}
                  At least one number
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.specialChar
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {passwordValidations.specialChar ? (
                    <CheckSquareIcon className="mr-2 text-green-500" />
                  ) : (
                    <SquareIcon className="mr-2" />
                  )}
                  At least one special character
                </li>
                <li
                  className={`flex items-center ${
                    submittedWithErrors && !passwordValidations.length
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {passwordValidations.length ? (
                    <CheckSquareIcon className="mr-2 text-green-500" />
                  ) : (
                    <SquareIcon className="mr-2" />
                  )}
                  At least 12 characters
                </li>
              </ul>
            </FormItem>
          )}
        />
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
            <span className={ loading ? "invisible [grid-area:1/1]" : "" }>Sign Up</span>
            {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default SignupForm;
