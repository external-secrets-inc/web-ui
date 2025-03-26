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
import { deleteAccount, getAccountData, updateAccountData } from '@/services/account/accountService';
import { useSignOut } from '@/hooks/useSignOut';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SettingsSection from './SettingsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideEdit, LucideMoreVertical, LucidePlus, LucideTrash2 } from "lucide-react";
import { DataProvider, DataTable } from "../ui/DataProvider";
import { createColumnHelper } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { FeatureItemDeleteAction } from "../FeatureCollection/FeatureItemDeleteAction";
import { AUDIT_QUERY_STALE_TIME } from "../audit/Audit.constants";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import { Dialog, DialogTrigger } from "../ui/dialog";

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
  permissions: string[];
}

interface UsersManagementTableMeta {
  renderRowActions?: (row: UsersManagementTableData) => React.ReactNode;
}

export interface UserForm {
  name: string;
  email: string;
  permissions: string[];
}

const OrganizationSettings: React.FC = () => {
  const signOut = useSignOut();

  const [accountData, setAccountData] = useState({
    contact_email: "",
    contact_name: "",
    contact_phone: "",
    tenant_name: "",
    tenant_id: "",
  });
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
    resolver: zodResolver(deleteFormSchema(accountData.tenant_name)),
    defaultValues: {
      tenant_name: "",
    },
  });

  // Fetch organization data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountData();
        setAccountData(data);
        form.reset({
          contact_email: data.contact_email || "",
          contact_name: data.contact_name || "",
          contact_phone: data.contact_phone || "",
        });
        deleteForm.reset({
          tenant_name: "",
        });
      } catch {
        toast.error('Failed to load organization data');
      }
    };

    fetchData();
  }, [form, deleteForm]);

  const columnHelper = createColumnHelper<UsersManagementTableData>();

  const usersManagementColumns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <strong>{info.getValue()}</strong>
    }),
    columnHelper.accessor('permissions', {
      header: 'Permissions',
      cell: info => info.getValue()?.join(" ; ") || ""
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
                // setSelectedUserId(row.id);
                // setUserForm({ name: row.name, engine: row.engine, executeOn: row.executeOn, sample: "", rule: isBase64(row.rule) ? atob(row.rule) : row.rule });
                // setIsAddUserDialogOpen(true);
              }}
            >
              <LucideEdit className="mr-2" />
              Edit User
            </DropdownMenuItem>
            <FeatureItemDeleteAction
              featureType={"Audit User"}
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
    permissions: [],
  };
  const [userForm, setUserForm] = useState<UserForm>(defaultUserFormValues);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const {
    data: usersData,
    refetch: usersRefetch,
    isLoading: isLoadingPolicies,
    isError: isErrorUsers,
    isRefetchError: isRefetchErrorUsers,
    error: usersError
  } = useGetUsers(false, accountData?.tenant_id, {
    staleTime: AUDIT_QUERY_STALE_TIME,
  });

  const users = useMemo(() => {
    if (!usersData) return []

    // Transform the API response to include the required id dataProvider field
    return usersData.map(user => ({
      ...user,
      id: user.id,
    }));
  }, [usersData]);

  const { mutate: createUser } = useCreateUser(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to create User"),
    onSuccess: () => {
      usersRefetch();
      toast.success("User created successfully")
    },
  });

  const { mutate: editUser } = useEditUser(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to edit User"),
    onSuccess: () => {
      usersRefetch();
      toast.success("User edited successfully")
    },
  });

  const { mutate: deleteUser } = useDeleteUser(false, {
    onError: (error: AxiosError<ApiHttpError>) => handleDefaultApiHttpError(error, "Error while trying to delete User"),
    onSuccess: () => {
      usersRefetch();
      toast.success("User deleted successfully")
    },
  });

  const performCreate = (payload: CreateUserPayload) => {
    payload.tenantID = accountData?.tenant_id;
    createUser(payload)
  };

  const performEdit = (editPayload: EditUserPayload) => {
    editUser(editPayload);
  };

  const performDelete = (policyID: string) => {
    deleteUser({ id: policyID });
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

  const handleAddUserSubmit = (payload: CreateUserPayload) => {
    if (selectedUserId) {
      const { name, executeOn, engine, rule } = { ...payload };
      const editPayload = { policyID: selectedUserId, payload: { name, executeOn, engine, rule } };
      performEdit(editPayload);
    } else {
      performCreate(payload);
    }
    handleAddUserDialogOpenChange(false);
  }

  async function handleSaveSection(values: FormSchemaType) {
    const dataToSend = {
      ...values,
      contact_phone: values.contact_phone || "",
    };

    try {
      await updateAccountData(dataToSend);
      toast.success('Organization details updated successfully');
      setAccountData((prev) => ({ ...prev, ...dataToSend }));
      form.reset(values);
    } catch {
      toast.error('Failed to update Organization details');
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      toast('Organization deleted');
      setIsDeleteDialogOpen(false);
      signOut({ reason: 'account_deleted' });
    } catch {
      toast.error('Failed to delete Organization');
    }
  }

  const subsections = [
    {
      title: 'Tenant Information',
      content: (
        <>
          <div className='space-y-2'>
            <FormLabel>Tenant ID</FormLabel>
            {accountData
              ? <p className="text-sm text-muted-foreground">{accountData?.tenant_id}</p>
              : <Skeleton className='h-5 w-[stretch] max-w-48' />
            }
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
      title: 'Contact Information',
      content: (
        <>
          <DataProvider
            data={users}
            columns={usersManagementColumns}
            initialSort={{ id: 'name', desc: false }}
            isLoading={isLoadingPolicies}
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
                  <strong className='block mt-2'>To confirm you must type your Organization URL: <span className='text-foreground'>{accountData.tenant_name}</span></strong>
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
                              placeholder={accountData.tenant_name}
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
