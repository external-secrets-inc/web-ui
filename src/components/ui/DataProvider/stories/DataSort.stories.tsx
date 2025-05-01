import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataSort } from '../DataSort';
import { DataTable } from '../DataTable';
import {
  type User,
  type CommonStoryProps,
  commonStoryArgs
} from './stories.utils';

type DataSortStoryProps = React.ComponentProps<typeof DataSort> & CommonStoryProps<User>;

/**
 * Story wrapper that combines DataProvider, DataSort, and DataTable components.
 * Demonstrates how the sort component controls ordering within the provider.
 */
const DataSortWithResults = (
  { data, columns, initialSort, getRowId, ...dataSortProps }: DataSortStoryProps
) => {
  return (
    <DataProvider<User>
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
    >
      <div className="flex justify-between items-center mb-4">
        <strong>Sortable Table</strong>
        <DataSort {...dataSortProps} />
      </div>
      <DataTable className="w-[600px]" />
    </DataProvider>
  );
};

const meta = {
  title: 'UI/DataProvider/DataSort',
  component: DataSort,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataSortStoryProps>;

export default meta;
type Story = StoryObj<DataSortStoryProps>;

export const Default: Story = {
  render: DataSortWithResults,
  args: {
    ...commonStoryArgs,
  },
};