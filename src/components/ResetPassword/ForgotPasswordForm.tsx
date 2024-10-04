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
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  tenant: z
  .string()
  .min(1, "Cannot be empty.")
  // .regex(/^[a-zA-Z0-9-]+$/, "Invalid URL. Should contain only letters, numbers, and dashes."),
  ,
  email: z.string().email("Invalid email address."),
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;


function ForgotPasswordForm() {
  const [forgotPasswordData] = useState<ForgotPasswordData>({tenant:"", email:""});
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: forgotPasswordData.email || "",
      tenant: forgotPasswordData.tenant || "",
    },
  });

  async function onSubmit(values: ForgotPasswordData) {
    setLoading(true)
    await forgotPassword(values.email, values.tenant)
    toast.success('', {description: `Check the instructions on your email to reset your password`} );
    setLoading(false)
  }

    const formError = null;
    const onBack = () => {navigate('/')};
    const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
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

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
          >
            <span className={ loading ? "invisible [grid-area:1/1]" : "" }>Reset Password</span>
            {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
          </Button>
        </div>
      </form>
    </Form>
      {formError && <div className="text-red-500">{formError}</div>}
</>
  );
}


export default ForgotPasswordForm;
