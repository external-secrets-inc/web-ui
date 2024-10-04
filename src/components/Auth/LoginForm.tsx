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
import { login } from "@/services/auth/authService";
import { getUserData } from '@/services/users/usersService';
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { LucideLoader } from "lucide-react";
import { useRef, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useForm, UseFormReturn } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import zValidations from "./fields/zValidations";

const LoginStep1Schema = z.object({
  organizationURL: zValidations.organizationURL
});

const LoginStep2Schema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Cannot be empty."),
});

type LoginStep1Data = z.infer<typeof LoginStep1Schema>;
type LoginStep2Data = z.infer<typeof LoginStep2Schema>;
type LoginData = Partial<LoginStep1Data & LoginStep2Data>;

interface LoginStep1FormProps {
  form: UseFormReturn<LoginStep1Data>;
  onSubmit: (data: LoginStep1Data) => void;
}

interface LoginStep2FormProps {
  form: UseFormReturn<LoginStep2Data>;
  onSubmit: (data: LoginStep2Data) => void;
  onBack: () => void;
  loading: boolean;
}

function LoginForm() {
  const [step, setStep] = useState(1);
  const [loginData, setLoginData] = useState<LoginData>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();
  const loginStep1Form = useForm<LoginStep1Data>({
    resolver: zodResolver(LoginStep1Schema),
    defaultValues: { organizationURL: "" },
  });

  const loginStep2Form = useForm<LoginStep2Data>({
    resolver: zodResolver(LoginStep2Schema),
    defaultValues: {
      email: loginData.email || "",
      password: loginData.password || "",
    },
  });

  const handleLoginStep1Submit = (data: LoginStep1Data) => {
    setLoginData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleLoginStep2Submit = async (data: LoginStep2Data) => {
    const finalData = { ...loginData, ...data };
    const stockError = "Something went wrong. Please try again.";
    setLoading(true);

    try {
      const { token, tenantId, tenant, userId } = await login(
        finalData.email!,
        finalData.password!,
        finalData.organizationURL!,
      );

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
          tenantId,
          tenant,
          userId,
        },
      });

      if (isSignedIn) {
        setLoading(false);
        return navigate(`/${finalData.organizationURL}/agents`);
      }

      setFormError(stockError);
    } catch (err) {
      if (isAxiosError(err)) {
        const responseError = err.response?.data?.errors?.body;

        if (responseError === "invalid username/password") {
          setLoading(false);
          return setFormError("Invalid login credentials");
        }
      }

      setFormError(stockError);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <>
      {step === 1 ? (
        <LoginStep1Form
          form={loginStep1Form}
          onSubmit={handleLoginStep1Submit}
        />
      ) : (
        <LoginStep2Form
          form={loginStep2Form}
          onSubmit={handleLoginStep2Submit}
          onBack={handleBack}
          loading={loading}
        />
      )}
      {formError && <div className="text-red-500">{formError}</div>}
    </>
  );
}

function LoginStep1Form({ form, onSubmit }: LoginStep1FormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="organizationURL"
          render={({ field }) => {
            const { ref, ...restField } = field;
            return (
              <FormItem>
                <FormLabel>Enter your Organization URL</FormLabel>
                <FormControl>
                  <div
                    onClick={() => inputRef.current?.focus()}
                    className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                  >
                    <span className="pl-3 text-sm text-muted-foreground/50">
                      app.externalsecrets.com/
                    </span>
                    <Input
                      ref={inputRef}
                      autoFocus
                      className="border-none pl-0 focus-visible:ring-0"
                      id="organizationURL"
                      placeholder="your-organization"
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

function LoginStep2Form({ form, onSubmit, onBack, loading }: LoginStep2FormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
              <div className="inline-flex w-full justify-between items-baseline">
                <FormLabel>Password</FormLabel>
                <Link to="/forgot-password" className="text-sm underline leading-none">
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input id="password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
          >
            <span className={ loading ? "invisible [grid-area:1/1]" : "" }>Login</span>
            {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default LoginForm;
