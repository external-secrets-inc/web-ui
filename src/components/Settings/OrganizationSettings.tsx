import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignOut } from '@/hooks/useSignOut';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SettingsSection from './SettingsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideCheck, LucideEdit, LucideMoreVertical, LucidePlus, LucideTrash2, LucideX } from "lucide-react";
import { DataProvider, DataTable } from "../ui/DataProvider";
import { createColumnHelper } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { FeatureItemDeleteAction } from "../FeatureCollection/FeatureItemDeleteAction";
import { AUDIT_QUERY_STALE_TIME } from "../audit/Audit.constants";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { createUserData, deleteUserData } from "@/services/users/usersService";
import useListUsersWithRoles from "@/services/users/queries/useListUsersWithRoles";
import { CreateUserDataPayload, UpdateUserDataPayload, UserForm } from "@/services/users/Users.interface";
import { Badge } from "@/components/ui/badge"
import UserDialogForm from "./UserDialogForm";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import useAddRoleForUserByID from "@/services/authz/mutations/useAddRoleForUserByID";
import useRemoveRoleForUserByID from "@/services/authz/mutations/useRemoveRoleForUserByID";
import useGetAccountData from "@/services/account/queries/useGetAccountData";
import useUpdateAccountData from "@/services/account/mutations/useUpdateAccountData";
import useDeleteAccountData from "@/services/account/mutations/useDeleteAccountData";
import useUpdateUserData from "@/services/users/mutations/useUpdateUserData";

const formSchema = z.object({
  contact_email: z.string().email({ message: "Invalid email address" }),
  contact_name: z.string().min(1, { message: "Cannot be empty" }),
  contact_phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

const deleteFormSchema = (tenantId: string) => z.object({
  tenant_name: z.string().min(1, { message: "Organization URL cannot be empty" }).refine(value => value === tenantId, {
    message: "Organization URL does not match",
  }),
});

type FormSchemaType = z.infer<typeof formSchema>;
type DeleteFormSchemaType = z.infer<ReturnType<typeof deleteFormSchema>>;

interface UsersManagementTableData {
  id: string;
  tenantID: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

interface UsersManagementTableMeta {
  renderRowActions?: (row: UsersManagementTableData) => React.ReactNode;
}

const OrganizationSettings: React.FC = () => {
  const signOut = useSignOut();

  const { data: accountData, isError: accountDataError, refetch: accountDataRefetch } = useGetAccountData()
  const { mutate: updateAccountData } = useUpdateAccountData({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Failed to update Organization details"),
    onSuccess: () => {
      toast.success('Organization details updated successfully');
      accountDataRefetch();
    }
  });

  const { mutate: deleteAccount } = useDeleteAccountData({
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Failed to delete Organization"),
    onSuccess: () => {
      toast('Organization deleted');
      setIsDeleteDialogOpen(false);
      signOut({ reason: 'account_deleted' });
    }
  });

  const { mutate: updateUserData } = useUpdateUserData({
    onSuccess: () => {
      usersRefetch()
      toast.success('User edited successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  })


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_email: "",
      contact_name: "",
      contact_phone: "",
    },
  });

  const deleteForm = useForm<DeleteFormSchemaType>({
    resolver: zodResolver(deleteFormSchema(accountData?.tenant_name || "")),
    defaultValues: {
      tenant_name: "",
    },
  });

  // Fetch organization data when the component mounts
  useEffect(() => {
    form.reset({
      contact_email: accountData?.contact_email || "",
      contact_name: accountData?.contact_name || "",
      contact_phone: accountData?.contact_phone || "",
    });
    deleteForm.reset({
      tenant_name: "",
    });
  }, [form, deleteForm, accountData]);

  if (accountDataError) {
    toast.error('Failed to load organization data');
  }

  const columnHelper = createColumnHelper<UsersManagementTableData>();

  const usersManagementColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => {
        const isActive = info.row.original.isActive;
        return (
          <strong className={!isActive ? 'text-muted-foreground' : ''}>
            {info.getValue()}
          </strong>
        );
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => {
        const isActive = info.row.original.isActive;
        return (
          <strong className={!isActive ? 'text-muted-foreground' : ''}>
            {info.getValue()}
          </strong>
        );
      }
    }),
    columnHelper.accessor('roles', {
      header: 'Roles',
      cell: info => {
        const isActive = info.row.original.isActive;
        const roles = info.getValue() as string[] | undefined;

        if (!roles || roles.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <Badge key={role} variant="secondary">
                <p className={!isActive ? 'text-muted-foreground' : ''}>{role}</p>
              </Badge>
            ))}
          </div>
        );
      }
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => {
        const isActive = info.getValue() as boolean;
        return <div className='flex justify-center'>
          {isActive ? (
            <LucideCheck className="text-success" />
            ) : (
              <LucideX className="items-center text-destructive"/>
            )}
        </div>
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as UsersManagementTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ], [columnHelper]);

  const usersManagementTableMeta: UsersManagementTableMeta = {
    renderRowActions: (row) => (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => event.stopPropagation()}
            >
              <LucideMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectedUserId(row.id);
                setUserForm({ name: row.name, email: row.email, roles: row.roles });
                setIsAddUserDialogOpen(true);
              }}
            >
              <LucideEdit className="mr-2" />
              Edit User
            </DropdownMenuItem>
            <FeatureItemDeleteAction
              featureType={"User"}
              featureID={row.id}
              featureName={row.name}
              onDelete={() => { performDelete(row.id) }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LucideTrash2 className="mr-2" />
                Delete User
              </DropdownMenuItem>
            </FeatureItemDeleteAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  };

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const defaultUserFormValues = {
    name: "",
    email: "",
    password: "",
    roles: [],
  };
  const [userForm, setUserForm] = useState<UserForm>(defaultUserFormValues);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const {
    data: usersData,
    refetch: usersRefetch,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    isRefetchError: isRefetchErrorUsers,
    error: usersError
  } = useListUsersWithRoles(false, {
    staleTime: AUDIT_QUERY_STALE_TIME,
  });

  const users: UsersManagementTableData[] = useMemo(() => {
    if (!usersData) return []

    // Filter out inactive users and map them to the table data structure
    return usersData.users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      tenantID: accountData?.tenant_id || "",
      roles: user.roles,
      isActive: user.is_active
    }));
  }, [usersData, accountData]);

  const performCreate = async (createPayload: CreateUserDataPayload) => {
    if (createPayload) {
      try {
        await createUserData(createPayload);
        usersRefetch()
        toast.success('User created successfully');
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        toast.error('Failed to create user');
      }
    }
  };

  const performEdit = (updatePayload: UpdateUserDataPayload) => {
    if (updatePayload) {
      updateUserData(updatePayload);
    }
  };

  const performDelete = async (userID: string) => {
    if (userID) {
      try {
        await deleteUserData(userID);
        usersRefetch()
        toast.success('User deleted successfully');
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        toast.error('Failed to create user');
      }
    }
  };

  useEffect(() => {
    if (!(usersError || isRefetchErrorUsers)) return;
    handleDefaultApiHttpError(usersError, "Error while fetching listener Audit data");
  }, [usersError, isErrorUsers, isRefetchErrorUsers]);

  const handleAddUserDialogOpenChange = (isOpen: boolean) => {
    setIsAddUserDialogOpen(isOpen);
    setUserForm(defaultUserFormValues);
    setSelectedUserId("");
  };

  const { mutateAsync: addRole } = useAddRoleForUserByID(false, {
    onError: (error) => handleDefaultApiHttpError(error, "Failed to assign role"),
  });

  const { mutateAsync: removeRole } = useRemoveRoleForUserByID(false, {
    onError: (error) => handleDefaultApiHttpError(error, "Failed to unassign role"),
  });

  const handleAddUserSubmit = async (payload: UserForm) => {
    if (selectedUserId) {
      // Handle basic user info update
      const { name, password } = { ...payload };
      const editPayload = {
        id: selectedUserId,
        name: name,
        ...(password && password.trim() !== "" ? { password } : {})
      };
      performEdit(editPayload);

      // Handle role assignments
      const currentUser = users.find(u => u.id === selectedUserId);
      if (!currentUser) return;

      const currentRoles = currentUser.roles || [];
      const newRoles = payload.roles || [];

      const rolesToRemove = currentRoles.filter(
        role => !newRoles.includes(role)
      );

      const rolesToAdd = newRoles.filter(
        role => !currentRoles.includes(role)
      );

      // Execute all role mutations in parallel
      const mutations = [
        ...rolesToRemove.map(role =>
          removeRole({ user_id: selectedUserId, role })
        ),
        ...rolesToAdd.map(role =>
          addRole({ user_id: selectedUserId, role })
        )
      ];

      await Promise.all(mutations);
      await usersRefetch();

      // Show success message for role changes
      if (rolesToAdd.length > 0 || rolesToRemove.length > 0) {
        const messages: string[] = [];
        if (rolesToAdd.length > 0) {
          messages.push(`${rolesToAdd.length} role${rolesToAdd.length !== 1 ? 's' : ''} assigned`);
        }
        if (rolesToRemove.length > 0) {
          messages.push(`${rolesToRemove.length} role${rolesToRemove.length !== 1 ? 's' : ''} removed`);
        }
        toast.success(messages.join(' and '));
      }
    } else {
      // Handle new user creation
      if (!payload.password) return;

      const userCreatePayload: CreateUserDataPayload = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      };
      performCreate(userCreatePayload);
    }
    handleAddUserDialogOpenChange(false);
  };

  async function handleSaveSection(values: FormSchemaType) {
    const dataToSend = {
      ...values,
      contact_phone: values.contact_phone || "",
    };
    updateAccountData(dataToSend);
  }

  async function handleDeleteAccount() {
    deleteAccount();
  }

  const subsections = [
    {
      title: 'Tenant Information',
      content: (
        <>
          <div className='space-y-2'>
            <FormLabel>Tenant ID</FormLabel>
            {accountDataError ? <p className="text-sm text-muted-foreground">---</p> : (
              accountData
                ? <p className="text-sm text-muted-foreground">{accountData?.tenant_id}</p>
                : <Skeleton className='h-5 w-[stretch] max-w-48' />
            )}
          </div>
        </>
      ),
    },
    {
      title: 'Contact Information',
      content: (
        <>
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 123-456-7890"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ),
    },
    {
      title: 'User Management',
      content: (
        <>
          <DataProvider
            data={users}
            columns={usersManagementColumns}
            initialSort={{ id: 'name', desc: false }}
            isLoading={isLoadingUsers}
          >
            <DataTable
              meta={usersManagementTableMeta}
            />
          </DataProvider>
          <Dialog open={isAddUserDialogOpen} onOpenChange={handleAddUserDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                className="self-end"
                variant="outline"
              >
                <LucidePlus />
                Add User
              </Button>
            </DialogTrigger>
            <UserDialogForm
              selectedUserId={selectedUserId}
              userForm={userForm}
              onSubmit={handleAddUserSubmit}
              onCancel={() => { handleAddUserDialogOpenChange(false) }}
            />
          </Dialog>
        </>
      ),
    },
    {
      title: 'Organization Data',
      content: (
        <>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="self-end"
                variant="destructive"
              >
                Delete Organization
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  Deleting this Organization will permanently remove all data associated with it in our database. This action is final and cannot be undone.
                  <strong className='block mt-2'>To confirm you must type your Organization URL: <span className='text-foreground'>{accountData?.tenant_name}</span></strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Form {...deleteForm}>
                <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)} className="grid gap-4">
                  <FormField
                    control={deleteForm.control}
                    name="tenant_name"
                    render={({ field }) => {
                      const { ref, ...restField } = field; // eslint-disable-line @typescript-eslint/no-unused-vars

                      return (
                        <FormItem>
                          <FormLabel>Enter your Organization URL to confirm</FormLabel>
                          <FormControl>
                            <Input
                              ref={inputRef}
                              autoFocus
                              placeholder={accountData?.tenant_name}
                              autoCapitalize="none"
                              {...restField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      type="submit"
                      variant="destructive"
                    >
                      Delete Organization
                    </Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];

  return (
    <SettingsSection
      title="Organization"
      description="Manage your Organization settings (Admin only)"
      form={form}
      onSubmit={handleSaveSection}
      subsections={subsections}
    />
  );
};

export default OrganizationSettings;
