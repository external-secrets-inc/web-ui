import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataSort } from '../DataSort';
import { DataTable } from '../DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { ProviderConfig } from '../DataProvider.interfaces';

// --- Copied Data/Types/Helpers ---
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const mockUsers: User[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin' },
];

const createUserColumns = () => {
  const columnHelper = createColumnHelper<User>();
  return [
    // Ensure sorting is enabled for columns intended to be sortable by DataSort
    columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('email', { header: 'Email', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('role', { header: 'Role', cell: info => info.getValue(), enableSorting: true }),
  ] as ColumnDef<User, unknown>[];
};
// --- End Copied Data/Types/Helpers ---

// --- Wrapper ---
// Use explicit User type
type DataSortWrapperProps = React.ComponentProps<typeof DataSort> &
  Pick<ProviderConfig<User>, 'data' | 'columns' | 'initialSort' | 'getRowId'>;

const DataSortWrapper = (
  { data, columns, initialSort, getRowId, ...dataSortProps }: DataSortWrapperProps
) => {
  return (
    <DataProvider<User> // Use explicit User type
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
    >
      <div className="flex justify-between items-center mb-4">
        <strong>Sortable Table</strong>
        <DataSort {...dataSortProps} />
      </div>
      {/* DataTable used here solely to display the results of the sorting */}
      <DataTable className="w-[600px]" />
    </DataProvider>
  );
};
// --- End Wrapper ---

// --- Meta ---
const meta = {
  title: 'UI/DataProvider/DataSort',
  component: DataSort,
  parameters: {
    layout: 'centered',
    // No docs description here - handled by DataSort.mdx
  },
  argTypes: {
    // DataProvider Parent Props Category (Not directly controllable in this context)
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataSortWrapperProps>;

export default meta;
type Story = StoryObj<DataSortWrapperProps>; // Use specific wrapper props type
// --- End Meta ---

// --- Stories ---
export const Default: Story = {
  render: DataSortWrapper,
  args: {
    // ProviderConfig props
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    // DataSortProps are inferred via ComponentProps; specific args like className can be added if needed
    // className: '...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default sort dropdown. Allows sorting by Name, Email, or Role.'
      }
    }
  }
};