import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import NewPasswordField from "./fields/NewPasswordField";
import zValidations from "./fields/zValidations";
import AppLogo from "@/components/AppLogo";
import Cookies from 'js-cookie';
import { APP_DOMAIN_STRIPPED } from "@/constants";
import useResetPassword from "@/services/forgotPassword/mutations/useResetPassword";

const ResetPasswordSchema = z.object({
  tenant: zValidations.organizationURL,
  email: zValidations.email,
  token: z.string(),
  password: zValidations.newPassword,
});

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordForm() {
  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
  let [searchParams, _] = useSearchParams();

  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  const { mutate: resetPassword, isPending: loading} = useResetPassword({
    onSuccess: () => {
      toast.success('Password updated successfully', { description: 'Please log in' });
      Cookies.remove("forgotPasswordHelperOrganizationURL");
      Cookies.remove("forgotPasswordHelperEmail");
      navigate('/login')
    }
  });

  const newPasswordRef = useRef<HTMLInputElement>(null);

  const formMethods = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      // TODO: Remove these cookies when we are sending the necessary data from the token within the reset password email link
      tenant: Cookies.get("forgotPasswordHelperOrganizationURL") || "",
      email: Cookies.get("forgotPasswordHelperEmail") || "",
      token: searchParams.get("token") || "",
      password: "",
    },
  });

  const { setFocus } = formMethods;

  useEffect(() => {
    // TODO: Remove these cookies when we are sending the necessary data from the token within the reset password email link
    const tenant = Cookies.get("forgotPasswordHelperOrganizationURL");
    const email = Cookies.get("forgotPasswordHelperEmail");

    if (tenant && email) {
      newPasswordRef.current?.focus();
    } else {
      setFocus("tenant");
    }
  }, [setFocus]);

  const handleSubmit = (data: ResetPasswordData) => {
    setSubmittedWithErrors(false);
    onSubmit(data);
  };

  const handleError = () => {
    setSubmittedWithErrors(true);
    setFormError("Failed to start the reset password flow")
  };

  async function onSubmit(values: ResetPasswordData) {
    resetPassword(values)
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="max-w-md w-full px-4 py-10 m-auto">
        <header className="mb-8">
          <AppLogo />
          <h1 className="text-2xl font-bold mb-1 mt-6">
            Set up a new password
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Once it's set, you can use it to log in again
          </p>
        </header>

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(handleSubmit, handleError)} className="grid gap-4">
            <FormField
              control={formMethods.control}
              name="tenant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter your Organization URL</FormLabel>
                  <FormControl>
                    <div
                      onClick={() => setFocus("tenant")}
                      className="border-input border rounded-md flex items-baseline focus-within:ring-ring focus-within:ring-1"
                    >
                      <span className="pl-3 text-sm text-muted-foreground/50">
                        {APP_DOMAIN_STRIPPED}/
                      </span>
                      <Input
                        className="border-none pl-0 focus-visible:ring-0"
                        autoCapitalize="none"
                        id="tenant"
                        placeholder="your-organization"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formMethods.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="you@yourcompany.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <NewPasswordField
              submittedWithErrors={submittedWithErrors}
              ref={newPasswordRef}
            />

            <div className="flex justify-between">
              <Button
                type="submit"
                disabled={loading}
                className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center w-full"
              >
                <span className={loading ? "invisible [grid-area:1/1]" : ""}>Update Password</span>
                {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
              </Button>
            </div>
          </form>
        </FormProvider>
        {formError && <div className="text-destructive">{formError}</div>}
      </div>
    </div>
  );
}

export default ResetPasswordForm;
