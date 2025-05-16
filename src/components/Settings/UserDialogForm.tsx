import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserForm } from "@/services/users/Users.interface";
import { useEffect } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/MultiSelect";
import InputPassword from "@/components/ui/InputPassword";

const getSchema = (selectedUserId: string | null) => {
  return z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.string().min(1, { message: "Email is required." }),
    password: selectedUserId
      ? z.string().optional()
      : z.string().min(1, { message: "Password is required." }),
    roles: selectedUserId
      ? z.array(z.string()).min(0)
      : z.array(z.string()).optional(),
  });
};

// TODO[iurisevero]: get roles from api, seens weird to hardcode them in frontend
const rolesArray = ["created_user_reader", "created_user_getter", "signup_user_admin", "reader", "getter", "writer", "admin"];
const rolesOptions = rolesArray.sort().map(x => ({ label: x, value: x.toLowerCase() }));

const UserDialogForm = ({ selectedUserId, userForm, onSubmit, onCancel }: {
  selectedUserId: string; userForm: UserForm; onSubmit: (payload: UserForm) => void; onCancel: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(getSchema(selectedUserId)),
    defaultValues: userForm,
  });

  useEffect(() => {
    form.reset(userForm);
  }, [userForm, form]);

  const resetForm = () => {
    form.reset(userForm);
  }

  const handleCancel = () => {
    resetForm();
    onCancel();
  }

  const handleSubmit = async (formValues: UserForm) => {
    await onSubmit(formValues);
    resetForm();
  };

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
    >
      <DialogHeader>
        <DialogTitle>{selectedUserId ? "Edit" : "Add"} User</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={Boolean(selectedUserId)} placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!selectedUserId && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <InputPassword
                      {...field}
                      value={field.value || ''}
                      newPasswordChecks
                      showValidationErrors={false}
                      placeholder="Enter new password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {Boolean(selectedUserId) &&
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={rolesOptions}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select roles"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          }
          <DialogFooter className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              aria-keyshortcuts="Escape"
              variant={"secondary"}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <div className="flex gap-4">
              <Button
                type="submit"
              >
                Submit
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UserDialogForm;
