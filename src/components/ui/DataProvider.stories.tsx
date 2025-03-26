// TODO: Find a way to show the complete component implementation (including
// state, effects, handlers) in the "Show Code" button instead of just the
// return statement. This is important for developers to understand the full
// implementation pattern.
import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider, DataTable, DataSearch, DataSort, DataGrid } from './DataProvider';
import { createColumnHelper } from '@tanstack/react-table';
import type { ProviderConfig } from './DataProvider';
import { Button } from './button';
import { LucideEdit, LucideMoreVertical, LucideTrash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Input } from './input';
import { LucideSearch } from 'lucide-react';
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
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
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
  ];
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
  ];
};

// Example component that uses DataProvider
const DataProviderExample = (args: ProviderConfig<User>) => {
  return (
    <DataProvider<User> {...args}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <strong>Users</strong>
        </div>
        <DataTable />
      </div>
    </DataProvider>
  );
};

// Example component with custom row ID
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

// Example with actions column
const createUserColumnsWithActions = () => {
  const columnHelper = createColumnHelper<User>();
  return [
    ...createUserColumns(),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as { renderRowActions?: (row: User) => React.ReactNode })?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ];
};

// Example component that uses DataProvider with actions
const DataProviderWithActionsExample = (args: ProviderConfig<User>) => {
  const tableMeta = {
    renderRowActions: (row: User) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <LucideMoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <LucideEdit className="mr-2" />
            Edit {row.name}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LucideTrash2 className="mr-2" />
            Delete {row.name}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  return (
    <DataProvider<User> {...args}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <strong>Users with Actions</strong>
        </div>
        <DataTable meta={tableMeta} />
      </div>
    </DataProvider>
  );
};

// Example with custom layout (grid)
const DataProviderGridExample = (args: ProviderConfig<User>) => {
  return (
    <DataProvider<User> {...args}>
      <div className="space-y-4 w-[800px]">
        <div className="flex justify-between items-center gap-4">
          <strong>Users in Grid Layout</strong>
        </div>
        <DataGrid
          renderItem={(item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.email}</p>
              <p className="text-sm text-muted-foreground">{item.role}</p>
            </div>
          )}
        />
      </div>
    </DataProvider>
  );
};
// Example showing all controls
const DataProviderControlsExample = (args: ProviderConfig<User>) => {
  return (
    <DataProvider<User> {...args}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <strong>Users with All Controls</strong>
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

// Example with backend filtering
const DataProviderBackendFilterExample = (args: ProviderConfig<User>) => {
  // State for URL params and search input
  const [searchParams, setSearchParams] = useState(new URLSearchParams());
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState(mockUsers);

  // Simulate API call with search params
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate backend filtering
    const search = searchParams.get('search')?.toLowerCase() || '';
    const filtered = mockUsers.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
    setFilteredData(filtered);

    setIsLoading(false);
  }, [searchParams]);

  // Fetch data when search params change
  useEffect(() => {
    fetchData();
  }, [searchParams, fetchData]);

  // Handle search input changes and update URL params
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

const meta = {
  title: 'UI/DataProvider',
  component: DataProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Required Setup

The DataProvider component requires proper setup with TanStack Table. Here's how to use it:

\`\`\`tsx
import { createColumnHelper } from '@tanstack/react-table';

// 1. Create a column helper for your data type
const columnHelper = createColumnHelper<YourDataType>();

// 2. Define your columns
const columns = [
  columnHelper.accessor('fieldName', {
    header: 'Column Header',
    cell: info => info.getValue(),
  }),
  // ... more columns
];

// 3. Pass the columns to DataProvider
<DataProvider
  data={yourData}
  columns={columns}
>
  <DataTable />
  <DataSearch /> {/* Optional: Adds search functionality */}
  <DataSort />   {/* Optional: Adds sort controls */}
</DataProvider>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataProvider>;

export default meta;
type Story<T extends object> = StoryObj<typeof DataProvider<T>>;

export const Default: Story<User> = {
  render: DataProviderExample,
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic setup with default configuration. Shows a simple table with data.'
      }
    }
  }
};

export const WithActionsColumn: Story<User> = {
  render: DataProviderWithActionsExample,
  args: {
    data: mockUsers,
    columns: createUserColumnsWithActions(),
    initialSort: { id: 'name', desc: false },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how to add an actions column with a dropdown menu. This pattern is a common pattern we use for tables that need to display actions for each row. PS: not limited to Kebab Menus, you can use any component you want.'
      }
    }
  }
};

export const GridLayout: Story<User> = {
  render: DataProviderGridExample,
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how to use DataGrid for a card-based layout instead of a table. This is used in our feature collections for a more visual representation.'
      }
    }
  }
};

export const Controls: Story<User> = {
  render: DataProviderControlsExample,
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all available controls (search and sort) working together. These controls can be used with either client-side or backend filtering.'
      }
    }
  }
};

export const BackendFiltering: Story<User> = {
  render: DataProviderBackendFilterExample,
  args: {
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates how to integrate with backend filtering using URL search params and API calls. This pattern is used in our AuditSecretTable where search parameters are synced with the URL and trigger API calls.

Key aspects of the implementation:
- URL params are used to track search state
- Search input is controlled independently from DataProvider
- Loading states are managed during API calls
- Data is filtered on the backend (simulated here)
- Search params trigger data fetching
`
      }
    }
  }
};

export const CustomRowId: Story<UserWithCustomId> = {
  render: CustomRowIdExample,
  args: {
    data: mockUsers.map(user => ({ ...user, customId: user.email })),
    columns: createCustomIdColumns(),
    initialSort: { id: 'name', desc: false },
    getRowId: (row: UserWithCustomId) => row.email,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a custom unique identifier (`email`) instead of the default `id` property. Useful when working with data that has different unique identifiers that are not called `id`.'
      }
    }
  }
};

export const EmptyState: Story<User> = {
  render: DataProviderExample,
  args: {
    data: [],
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    emptyMessage: "No users found",
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the table handles empty data states with a custom message. This state appears when data is empty or when search returns no results.'
      }
    }
  }
};