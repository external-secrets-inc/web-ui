import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider, DataTable, DataSearch, DataSort } from './DataProvider';
import { createColumnHelper } from '@tanstack/react-table';
import type { ProviderConfig } from './DataProvider';

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
        <div className="flex justify-between items-center gap-2">
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

// Example component with custom row ID
const CustomRowIdExample = (args: ProviderConfig<UserWithCustomId>) => {
  return (
    <DataProvider<UserWithCustomId> {...args}>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
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

### Features
- Automatic sorting (click headers or use DataSort)
- Global search with DataSearch
- Loading states with spinner
- Empty state handling
- Custom row ID support
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
        story: 'Basic setup with default configuration. Shows search, sort, and table components working together.'
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