import { isAxiosError } from 'axios';
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/services/auth/authService";
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

const LoginStep1Schema = z.object({
  workspaceName: z.string().min(1, "Please enter your workspace name."),
});

const LoginStep2Schema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Please enter your password."),
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
}

function LoginForm() {
  const [step, setStep] = useState(1);
  const [loginData, setLoginData] = useState<LoginData>({});
  const [formError, setFormError] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const loginStep1Form = useForm<LoginStep1Data>({
    resolver: zodResolver(LoginStep1Schema),
    defaultValues: { workspaceName: "" },
  });

  const loginStep2Form = useForm<LoginStep2Data>({
    resolver: zodResolver(LoginStep2Schema),
    defaultValues: { email: loginData.email || "", password: loginData.password || "" },
  });

  const handleLoginStep1Submit = (data: LoginStep1Data) => {
    setLoginData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleLoginStep2Submit = async (data: LoginStep2Data) => {
    const finalData = { ...loginData, ...data };
    const stockError = "Something went wrong. Please try again.";

    try {
      const token = await login(finalData.email!, finalData.password!, finalData.workspaceName!);
      const isSignedIn = authKitSignIn({
        auth: {
          token,
          type: "Bearer",
        },
        userState: {
          email: finalData.email,
          workspaceName: finalData.workspaceName,
        },
      });

      if (isSignedIn) {
        return navigate("/");
      }
      setFormError(stockError);

    } catch (err) {
      if (isAxiosError(err)) {
        const responseError = err.response?.data?.errors?.body;

        if (responseError === "invalid username/password") {
          return setFormError("Invalid login credentials");
        }
        if (responseError === "invalid tenant") {
          return setFormError("Workspace not found");
        }
      }

      setFormError(stockError);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <>
      {step === 1 ? (
        <LoginStep1Form form={loginStep1Form} onSubmit={handleLoginStep1Submit} />
      ) : (
        <LoginStep2Form form={loginStep2Form} onSubmit={handleLoginStep2Submit} onBack={handleBack} />
      )}
      {formError && <div className="text-red-500">{formError}</div>}
    </>
  );
}

function LoginStep1Form({ form, onSubmit }: LoginStep1FormProps) {
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
        <Button type="submit" className="w-full">
          Next
        </Button>
      </form>
    </Form>
  );
}

function LoginStep2Form({ form, onSubmit, onBack }: LoginStep2FormProps) {
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
              <div className="inline-flex w-full justify-between items-baseline">
                {/* TODO: Are we already able to provide a forgot your password feature? */}
                <FormLabel>Password</FormLabel>
                <Link to="#" className="text-sm underline leading-none">
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
          <Button type="submit">
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default LoginForm;