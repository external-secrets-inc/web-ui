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
import { resetPassword } from "@/services/forgotPassword/forgotPasswordService";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideLoader } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import NewPasswordField from "../fields/NewPasswordField";
import zValidations from "../fields/zValidations";

const ResetPasswordSchema = z.object({
  tenant: zValidations.organizationURL,
  email: zValidations.email,
  token: z.string(),
  password: zValidations.newPassword,
});

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordForm() {
  let [searchParams, _] = useSearchParams()
  const [forgotPasswordData] = useState<ResetPasswordData>({ tenant: "", email: "", token: searchParams.get("token"), password: "" });
  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { ...forgotPasswordData },
  });

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);

  const handleSubmit = (data: ResetPasswordData) => {
    setSubmittedWithErrors(false);
    onSubmit(data);
  };

  const handleError = () => {
    setSubmittedWithErrors(true);
  };

  async function onSubmit(values: ResetPasswordData) {
    setLoading(true)
    try {
      await resetPassword(values.email, values.tenant, values.password, values.token)
      toast.success('', { description: `Check the instructions on your email to reset your password` });
    } finally {
      setLoading(false)
    }
  }

  const formError = null;
  const onBack = () => { navigate('/') };
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, handleError)} className="grid gap-4">
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

          <NewPasswordField form={form} submittedWithErrors={submittedWithErrors}/>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
            >
              <span className={loading ? "invisible [grid-area:1/1]" : ""}>Reset Password</span>
              {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
            </Button>
          </div>
        </form>
      </Form>
      {formError && <div className="text-red-500">{formError}</div>}
    </>
  );
}


export default ResetPasswordForm;
