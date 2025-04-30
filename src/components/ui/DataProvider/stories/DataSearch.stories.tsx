import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataSearch } from '../DataSearch';
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
    columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue() }),
    columnHelper.accessor('email', { header: 'Email', cell: info => info.getValue() }),
    columnHelper.accessor('role', { header: 'Role', cell: info => info.getValue() }),
  ] as ColumnDef<User, unknown>[];
};
// --- End Copied Data/Types/Helpers ---

// --- Wrapper ---
// Use explicit User type & React.ComponentProps
type DataSearchWrapperProps = React.ComponentProps<typeof DataSearch> &
  Pick<ProviderConfig<User>, 'data' | 'columns' | 'initialSort' | 'getRowId'>;

const DataSearchWrapper = (
  { data, columns, initialSort, getRowId, ...dataSearchProps }: DataSearchWrapperProps
) => {
  return (
    <DataProvider<User>
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
    >
      <div className="flex justify-between items-center mb-4">
        <strong>Searchable Table</strong>
        <DataSearch {...dataSearchProps} />
      </div>
      {/* DataTable used here solely to display the results of the search filter */}
      <DataTable className="w-[600px]" />
    </DataProvider>
  );
};
// --- End Wrapper ---

// --- Meta ---
const meta = {
  title: 'UI/DataProvider/DataSearch',
  component: DataSearch,
  parameters: {
    layout: 'centered',
    // No docs description here - handled by DataSearch.mdx
  },
  argTypes: {
    // DataProvider Parent Props Category (Not directly controllable in this context)
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataSearchWrapperProps>;

export default meta;
type Story = StoryObj<DataSearchWrapperProps>; // Use specific wrapper props type
// --- End Meta ---

// --- Stories ---
export const Default: Story = {
  render: DataSearchWrapper,
  args: {
    // ProviderConfig props
    data: mockUsers,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    // DataSearchProps are inferred via ComponentProps; specific Input props like placeholder are passed through
  },
  parameters: {
    docs: {
      description: {
        story: 'Default search input. Type to filter the table below.'
      }
    }
  }
};