import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataTable, DataSearch, DataSort } from '..';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import type { ProviderConfig } from '../DataProvider.interfaces';
import { LucideSearch } from 'lucide-react';
import { Input } from '../../input';
import { useState, useCallback, useEffect } from 'react';

// Example types and data
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type UserWithCustomId = User & {
  customId: string;
};

const mockUsers: User[] = [
  { id: 1, name: 'Context User 1', email: 'ctx1@example.com', role: 'Admin' },
  { id: 2, name: 'Context User 2', email: 'ctx2@example.com', role: 'User' },
];

// Create column definitions
const createUserColumns = () => {
  const columnHelper = createColumnHelper<User>();
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => info.getValue(),
    }),
  ] as ColumnDef<User, unknown>[];
};

const createCustomIdColumns = () => {
  const columnHelper = createColumnHelper<UserWithCustomId>();
  return [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => info.getValue(),
    }),
  ] as ColumnDef<UserWithCustomId, unknown>[];
};

// Story component demonstrating external filtering with DataProvider
const DataProviderBackendFilterExample = (args: ProviderConfig<User>) => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(mockUsers);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const search = searchParams.get('search')?.toLowerCase() || '';
    const filtered = mockUsers.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
    setFilteredData(filtered);
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [searchParams, fetchData]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  return (
    <DataProvider<User> {...args} data={filteredData} isLoading={isLoading}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <strong>Users with Backend Filtering</strong>
          <div className="flex gap-2">
            <div className="relative">
              <Input
                placeholder="Search..."
                value={searchInputValue}
                onChange={handleSearchInputChange}
                className="pr-7"
              />
              <LucideSearch className="absolute inset-y-0 right-3 self-center text-muted-foreground" />
            </div>
            <DataSort />
          </div>
        </div>
        <DataTable />
      </div>
    </DataProvider>
  );
};

// Story component demonstrating DataProvider with a custom getRowId function
const CustomRowIdExample = (args: ProviderConfig<UserWithCustomId>) => {
  return (
    <DataProvider<UserWithCustomId> {...args}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <strong>Users with email as unique ID</strong>
          <div className="flex gap-2">
            <DataSearch />
            <DataSort />
          </div>
        </div>
        <DataTable />
      </div>
    </DataProvider>
  );
};

const meta = {
  title: 'UI/DataProvider',
  component: DataProvider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<ProviderConfig<User>>;

export default meta;
type Story = StoryObj<ProviderConfig<User>>;
type CustomIdStory = StoryObj<ProviderConfig<UserWithCustomId>>;

export const Default: Story = {
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  render: (args: ProviderConfig<User>) => (
    <DataProvider {...args}>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">DataProvider wrapping a DataTable:</p>
        <DataTable className="w-[600px]" />
      </div>
    </DataProvider>
  ),
};

export const BackendFiltering: Story = {
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  render: DataProviderBackendFilterExample,
};

export const CustomRowId: CustomIdStory = {
  args: {
    data: mockUsers.map(user => ({ ...user, customId: user.email })),
    columns: createCustomIdColumns(),
    initialSort: { id: 'name', desc: false },
    getRowId: (row: UserWithCustomId) => row.email,
  },
  render: CustomRowIdExample,
};

export const LoadingState: Story = {
  args: {
    data: [],
    columns: createUserColumns(),
    isLoading: true,
  },
  render: (args: ProviderConfig<User>) => (
    <DataProvider {...args}>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">DataProvider in loading state:</p>
        <DataTable className="w-[600px]" />
      </div>
    </DataProvider>
  ),
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns: createUserColumns(),
    isLoading: false,
    emptyMessage: "Custom empty message from Provider."
  },
  render: (args: ProviderConfig<User>) => (
    <DataProvider {...args}>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">DataProvider showing custom empty message:</p>
        <DataTable className="w-[600px]" />
      </div>
    </DataProvider>
  ),
};

// Story GridLayout moved to DataGrid.stories.tsx

// Story Controls might be simplified or moved later