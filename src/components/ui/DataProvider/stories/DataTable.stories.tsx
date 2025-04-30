import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataTable } from '../DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { ProviderConfig, DataTableProps } from '../DataProvider.interfaces';
import { Button } from '../../button';
import { LucideEdit, LucideMoreVertical, LucideTrash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import React from 'react';

// --- Data/Types/Helpers ---
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const generateLargeDataset = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i+1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'Viewer'
  }));
};

const largeDataset = generateLargeDataset(200);
const mockUsers: User[] = generateLargeDataset(5); // Small dataset for non-virtualized stories

const createUserColumns = () => {
  const columnHelper = createColumnHelper<User>();
  return [
    columnHelper.accessor('name', { header: 'Name', cell: info => info.getValue() }),
    columnHelper.accessor('email', { header: 'Email', cell: info => info.getValue() }),
    columnHelper.accessor('role', { header: 'Role', cell: info => info.getValue() }),
  ] as ColumnDef<User, unknown>[];
};

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
  ] as ColumnDef<User, unknown>[];
};
// --- End Data/Types/Helpers ---

// --- Wrapper ---
// Explicitly type the wrapper for User data to ensure type safety
// Use Omit to handle the conflicting onRowClick type signature between
// DataTableProps<User, object> and the desired generic (rowData: object) signature for Storybook actions
type DataTableWrapperProps = Omit<DataTableProps<User, object>, 'onRowClick'> &
  { onRowClick?: (rowData: object) => void } & // Allow generic onRowClick for story interaction
  // Pick standard Provider props required by the DataProvider
  Pick<ProviderConfig<User>, 'data' | 'columns' | 'initialSort' | 'getRowId'> &
  { meta?: object }; // Include meta for row actions

const DataTableWrapper = (
  // Destructure meta explicitly to pass it via tableOptions
  // Ensure it's not in ...dataTableProps passed directly to DataTable
  { data, columns, initialSort, getRowId, onRowClick, meta, ...dataTableProps }: DataTableWrapperProps
) => {
  // Define the correctly typed handler here to bridge the generic storybook action and the specific DataTable<User> prop
  const handleRowClick = React.useCallback((rowData: User) => {
      if (onRowClick) {
          onRowClick(rowData);
      }
  }, [onRowClick]);

  return (
    <DataProvider<User>
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
      // Pass meta via tableOptions so it's accessible in column definitions
      tableOptions={{ meta }}
    >
      {/* Optional: Add controls if needed for specific stories */}
      {/* <div className="flex justify-end gap-2 mb-4">
        <DataSearch />
        <DataSort />
      </div> */}
      {/* Pass the correctly typed handleRowClick to DataTable, casting the generic action handler */}
      <DataTable {...dataTableProps} onRowClick={handleRowClick as (rowData: object) => void} />
    </DataProvider>
  );
};
// --- End Wrapper ---

// --- Meta ---
const meta = {
  title: 'UI/DataProvider/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Provider Props Category
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  },
} satisfies Meta<DataTableWrapperProps>;

export default meta;
type Story = StoryObj<DataTableWrapperProps>;
// --- End Meta ---

// --- Stories ---


export const RowClick: Story = {
    render: DataTableWrapper,
    name: "Feature: Row Click",
    args: {
      data: mockUsers,
      columns: createUserColumns(),
      initialSort: { id: 'name', desc: false },
      // Pass the generic handler, wrapper will adapt it
      onRowClick: (row: object) => { alert(`Clicked on ${JSON.stringify(row)}`); },
      className: "w-[600px]"
    },
};

export const RowActions: Story = {
  render: DataTableWrapper,
  name: "Feature: Row Actions",
  args: {
    data: mockUsers,
    columns: createUserColumnsWithActions(),
    initialSort: { id: 'name', desc: false },
    meta: {
      renderRowActions: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><LucideMoreVertical /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem><LucideEdit className="mr-2" />Edit {row.name}</DropdownMenuItem>
            <DropdownMenuItem><LucideTrash2 className="mr-2" />Delete {row.name}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    className: "w-[600px]"
  },
};

export const RowsAppend: Story = {
    render: DataTableWrapper,
    name: "Feature: Rows Append",
    args: {
      data: mockUsers,
      columns: createUserColumns(),
      initialSort: { id: 'name', desc: false },
      rowsAppend: (
        <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground p-4 font-semibold">
                --- End of Data ---
            </TableCell>
        </TableRow>
      ),
      className: "w-[600px]"
    },
};

export const StaticVirtualization: Story = {
  render: DataTableWrapper,
  name: "Virtualization: Static",
  args: {
    data: largeDataset,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    virtualizationMode: "static",
    rowHeight: 40,
    className: "h-[400px] w-[600px]",
  },
};

export const DynamicVirtualization: Story = {
  render: DataTableWrapper,
  name: "Virtualization: Dynamic",
  args: {
    data: largeDataset,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    className: "h-[400px] w-[600px]",
    virtualizationMode: "dynamic",
    virtualizerOptions: {
      estimateSize: (index: number) => {
        const role = largeDataset[index].role;
        return role === 'Admin' ? 60 : role === 'Editor' ? 50 : 40;
      }
    },
  },
};

export const WindowVirtualization: Story = {
  render: DataTableWrapper,
  name: "Virtualization: Window",
  args: {
    data: largeDataset,
    columns: createUserColumns(),
    initialSort: { id: 'name', desc: false },
    virtualizationMode: "static",
    virtualizationContainer: "window",
    rowHeight: 40,
    // Example of setting offset via className: className="[--window-container-header-offset:64px]"
  },
  parameters: {
    layout: 'fullscreen', // Necessary for window scroll to be testable
    docs: { // Provide context within the story description
        description: {
            story: "Uses the browser window to scroll. May require setting `--window-container-header-offset` (see MDX Docs). View in Canvas mode."
        }
    }
  }
};

// --- End Stories ---