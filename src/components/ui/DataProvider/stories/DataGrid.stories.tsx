import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataGrid } from '../DataGrid';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { ProviderConfig, DataGridProps } from '../DataProvider.interfaces';
import React from 'react';

// --- Data/Types/Helpers ---
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

// Note: Columns are needed by DataProvider for context, even if DataGrid doesn't display them directly as headers.
const createUserColumns = () => {
  const columnHelper = createColumnHelper<User>();
  return [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', { header: 'Role' }),
  ] as ColumnDef<User, unknown>[];
};
// --- End Data/Types/Helpers ---

// --- Wrapper ---
type DataGridWrapperProps = DataGridProps<User> &
  Pick<ProviderConfig<User>, 'data' | 'columns' | 'initialSort' | 'getRowId'>;

const DataGridWrapper = (
  { data, columns, initialSort, getRowId, ...dataGridProps }: DataGridWrapperProps
) => {
  return (
    <DataProvider<User>
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
    >
      {/* Pass renderItem, casting it to the generic type expected by DataGridProps<object> */}
      {/* The actual function passed in args uses the specific User type for correctness */}
      <DataGrid {...dataGridProps} renderItem={dataGridProps.renderItem as (item: object) => React.ReactNode} />
    </DataProvider>
  );
};
// --- End Wrapper ---

// --- Meta ---
const meta = {
  title: 'UI/DataProvider/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'centered',
    // No docs description here - handled by DataGrid.mdx
  },
  argTypes: {
    // DataProvider Parent Props Category
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataGridWrapperProps>;

export default meta;
type Story = StoryObj<DataGridWrapperProps>;
// --- End Meta ---

// --- Stories ---
export const Default: Story = {
  render: DataGridWrapper,
  args: {
    // ProviderConfig props
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    // DataGridProps
    // Ensure renderItem uses the specific User type within the story definition for type safety
    renderItem: (item: User) => {
        return (
          <div key={item.id} className="p-4 border rounded-lg w-full">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.email}</p>
            <p className="text-sm text-muted-foreground">{item.role}</p>
          </div>
        );
      },
    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-[800px]",
  },
};
// --- End Stories ---

