import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataTable } from '../DataTable';
import type { DataTableProps } from '../DataProvider.interfaces';
import { Button } from '../../button';
import { LucideEdit, LucideMoreVertical, LucideTrash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../dropdown-menu';
import {
  type User,
  type CommonStoryProps,
  commonStoryArgs,
  baseVirtualizationArgs,
  createColumnsWithActions
} from './stories.utils';
import { TableCell } from '@/components/ui/table';
import { TableRow } from '@/components/ui/table';

/**
 * Props combining Storybook needs with DataTable and DataProvider requirements.
 * Handles type adaptation for both the onRowClick handler and meta object.
 */
type DataTableStoryProps = Omit<DataTableProps<User>, 'onRowClick'> &
  { onRowClick?: (rowData: User) => void } &
  CommonStoryProps<User> &
  { meta?: object };

/**
 * DataTable component wrapper for Storybook that includes DataProvider
 */
const DataTableWithProvider = (
  {
    data,
    columns,
    initialSort,
    getRowId,
    meta,
    onRowClick,
    ...dataTableProps
  }: DataTableStoryProps
) => {
  const handleRowClick = (rowData: User) => {
    onRowClick?.(rowData);
  };

  return (
    <DataProvider
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
      meta={meta}
    >
      <DataTable
        {...dataTableProps}
        onRowClick={(rowData: unknown) => {
          handleRowClick(rowData as User);
        }}
      />
    </DataProvider>
  );
};

const meta = {
  title: 'UI/DataProvider/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  },
} satisfies Meta<DataTableStoryProps>;

export default meta;
type Story = StoryObj<DataTableStoryProps>;

/**
 * Common configuration applied to all DataTable stories
 */
const baseStoryArgs = {
  ...commonStoryArgs,
  className: "w-[600px]",
};

export const RowClick: Story = {
    render: DataTableWithProvider,
    name: "Feature: Row Click",
    args: {
      ...baseStoryArgs,
      onRowClick: (row: User) => { alert(`Clicked on ${JSON.stringify(row)}`); },
    },
};

export const RowActions: Story = {
  render: DataTableWithProvider,
  name: "Feature: Row Actions",
  args: {
    ...baseStoryArgs,
    columns: createColumnsWithActions((row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><LucideMoreVertical /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem><LucideEdit className="mr-2" />Edit {row.name}</DropdownMenuItem>
          <DropdownMenuItem><LucideTrash2 className="mr-2" />Delete {row.name}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )),
  },
};

export const RowsAppend: Story = {
    render: DataTableWithProvider,
    name: "Feature: Custom Appended Row Rendering",
    args: {
      ...baseStoryArgs,
      rowsAppend: (
        <TableRow>
          <TableCell colSpan={4} className="text-center p-4 bg-muted">
            <div className="font-medium">Summary Row</div>
            <div className="text-sm text-muted-foreground">This row is appended outside the table body.</div>
          </TableCell>
        </TableRow>
      )
    },
};

/**
 * Primary story used in the docs - displayed at the top of the documentation.
 * Demonstrates the recommended static virtualization mode.
 */
export const StaticVirtualization: Story = {
  render: DataTableWithProvider,
  name: "Static Row Height Virtualization",
  args: {
    ...baseVirtualizationArgs,
    className: "w-[600px] h-[400px]",
    virtualizationMode: 'static',
  },
};

/**
 * Demonstrates dynamic virtualization which measures row heights at runtime.
 * Less performant than static but supports variable height rows.
 */
export const DynamicVirtualization: Story = {
  render: DataTableWithProvider,
  name: "Dynamic Row Height Virtualization",
  args: {
    ...baseVirtualizationArgs,
    className: "w-[600px] h-[400px]",
    virtualizationMode: 'dynamic',
    virtualizerOptions: {
      estimateSize: () => 48,
      overscan: 5,
    },
  },
};

// TODO[cfviotti]: Add a story for the custom selector container virtualization mode

/**
 * Demonstrates window-based virtualization where the browser window is the scroll container.
 * Useful for full-page tables integrated with the main page scroll.
 */
export const WindowVirtualization: Story = {
  render: DataTableWithProvider,
  name: "Window Virtualization",
  args: {
    ...baseVirtualizationArgs,
    className: "w-full [--virtual-container-header-offset:0px]",
    virtualizationMode: 'static',
    virtualizationContainer: 'window',
  },
  parameters: {
    layout: 'fullscreen',
  }
};