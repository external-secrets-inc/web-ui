import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";
import { LucideEye, LucideEyeOff, LucideLoader } from "lucide-react";

interface LoginCredentialsStepProps {
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function LoginCredentialsStep({ onSubmit, onBack, loading }: LoginCredentialsStepProps) {
  const { control, handleSubmit, getValues } = useFormContext();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <form
      id="login-credentials-form"
      onSubmit={handleSubmit(onSubmit)}
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
                tabIndex={1}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <div className="inline-flex w-full justify-between items-baseline">
              <FormLabel>Password</FormLabel>
              <Link
                to="/forgot-password"
                state={{ organizationURL: getValues("organizationURL"), email: getValues("email") }}
                className="text-sm underline leading-none"
                tabIndex={5}
              >
                Forgot your password?
              </Link>
            </div>
            <FormControl>
            <div className="relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                tabIndex={2}
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title={passwordVisible ? "Hide password" : "Show password"}
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0"
              >
                {passwordVisible ? <LucideEyeOff /> : <LucideEye />}
              </Button>
            </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          tabIndex={4}
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center"
          tabIndex={3}
        >
          <span className={ loading ? "invisible [grid-area:1/1]" : "" }>Login</span>
          {loading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
        </Button>
      </div>
    </form>
  );
}