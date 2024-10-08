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
import { LucideLoader } from "lucide-react";

interface LoginCredentialsStepProps {
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function LoginCredentialsStep({ onSubmit, onBack, loading }: LoginCredentialsStepProps) {
  const { control, handleSubmit } = useFormContext();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
  );
}