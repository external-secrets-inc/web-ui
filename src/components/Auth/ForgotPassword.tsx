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
import { forgotPassword } from "@/services/forgotPassword/forgotPasswordService";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import zValidations from "./fields/zValidations";
import AppLogo from "@/components/AppLogo";
import Cookies from 'js-cookie';

const ForgotPasswordSchema = z.object({
  tenant: zValidations.organizationURL,
  email: zValidations.email,
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const location = useLocation()
  const toastIdRef = useRef<string | number | null>(null);

  const state = location.state as { organizationURL?: string; email?: string };
  const defaultTenant = state?.organizationURL || "";
  const defaultEmail = state?.email || "";

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      tenant: defaultTenant,
    },
  });

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const tenantInputRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    if (defaultTenant) {
      if (!defaultEmail || !zValidations.email.safeParse(defaultEmail).success) {
        emailInputRef.current?.focus();
      } else {
        submitButtonRef.current?.focus();
      }
    } else {
      tenantInputRef.current?.focus();
    }
  }, [location, defaultTenant, defaultEmail])

  async function onSubmit(values: ForgotPasswordData) {
    setLoading(true)
    setFormError("")
    try {
      await forgotPassword(values.email, values.tenant);
      // TODO: Remove these cookies when we are sending the necessary data from the token within the reset password email link
      const tenMinutesFromNow = new Date(new Date().getTime() + 10 * 60 * 1000);
      Cookies.set("forgotPasswordHelperOrganizationURL", values.tenant, { expires: tenMinutesFromNow });
      Cookies.set("forgotPasswordHelperEmail", values.email, { expires: tenMinutesFromNow });

      toastIdRef.current = toast.success('Check your email', {
        description: 'We sent instructions to reset your password',
        duration: Infinity,
        cancel: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    } catch (e) {
      setFormError("Failed to start the reset password flow")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="max-w-md w-full px-4 py-10 m-auto">
        <header className="mb-8">
          <AppLogo />
          <h1 className="text-2xl font-bold mb-1 mt-6">
            Reset Password
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Include the Organization URL and email address associated with your account and we'll send you an email with instructions to reset your password
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="tenant"
              render={({ field }) => {
                const { ref, ...restField } = field;
                return (
                  <FormItem>
                    <FormLabel>Enter your Organization URL</FormLabel>
                    <FormControl>
                      <div
                        onClick={() => tenantInputRef.current?.focus()}
                        className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                      >
                        <span className="pl-3 text-sm text-muted-foreground/50">
                          app.externalsecrets.com/
                        </span>
                        <Input
                          ref={tenantInputRef}
                          className="border-none pl-0 focus-visible:ring-0"
                          autoCapitalize="none"
                          id="tenant"
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const { ref, ...restField } = field;
                return (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        ref={(e) => {
                          ref(e); // Assign to react-hook-form ref
                          emailInputRef.current = e; // Assign to local ref
                        }}
                        id="email"
                        placeholder="you@yourcompany.com"
                        {...restField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link to="/login">Back to login</Link>
              </Button>
              <Button
                ref={submitButtonRef}
                type="submit"
                disabled={loading}
                className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
              >
                <span className={loading ? "invisible [grid-area:1/1]" : ""}>Send instructions</span>
                {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
              </Button>
            </div>
          </form>
        </Form>
        {formError && <div className="mt-4 text-red-500">{formError}</div>}
      </div>
    </div>
  );
}

export default ForgotPassword;
