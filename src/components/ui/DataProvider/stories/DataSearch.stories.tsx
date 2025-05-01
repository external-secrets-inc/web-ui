import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataSearch } from '../DataSearch';
import { DataTable } from '../DataTable';
import {
  type User,
  type CommonStoryProps,
  commonStoryArgs
} from './stories.utils';

type DataSearchStoryProps = React.ComponentProps<typeof DataSearch> & CommonStoryProps<User>;

/**
 * Story wrapper that combines DataProvider, DataSearch, and DataTable components.
 * Demonstrates how the search component controls filtering within the provider.
 */
const DataSearchWithResults = (
  { data, columns, initialSort, getRowId, ...dataSearchProps }: DataSearchStoryProps
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
      <DataTable className="w-[600px]" />
    </DataProvider>
  );
};

const meta = {
  title: 'UI/DataProvider/DataSearch',
  component: DataSearch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataSearchStoryProps>;

export default meta;
type Story = StoryObj<DataSearchStoryProps>;

export const Default: Story = {
  render: DataSearchWithResults,
  args: {
    ...commonStoryArgs,
  },
};