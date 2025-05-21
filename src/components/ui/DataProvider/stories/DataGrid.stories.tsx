import type { Meta, StoryObj } from '@storybook/react';
import { DataProvider } from '../DataProviderContext';
import { DataGrid } from '../DataGrid';
import type { DataGridProps } from '../DataProvider.interfaces';
import React from 'react';
import {
  type User,
  type CommonStoryProps,
  commonStoryArgs
} from './stories.utils';

type DataGridStoryProps = DataGridProps<User> & CommonStoryProps<User>;

/**
 * Story wrapper that combines DataProvider and DataGrid components.
 * Bridges the gap between Storybook's generic interface and strongly typed components.
 */
const DataGridWithProvider = (
  { data, columns, initialSort, getRowId, ...dataGridProps }: DataGridStoryProps
) => {
  return (
    <DataProvider<User>
      data={data}
      columns={columns}
      initialSort={initialSort}
      getRowId={getRowId}
    >
      <DataGrid
        {...dataGridProps}
        renderItem={dataGridProps.renderItem as (item: object) => React.ReactNode}
      />
    </DataProvider>
  );
};

const meta = {
  title: 'UI/DataProvider/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { table: { category: 'DataProvider Props' } },
    columns: { table: { category: 'DataProvider Props' } },
    initialSort: { table: { category: 'DataProvider Props' } },
  }
} satisfies Meta<DataGridStoryProps>;

export default meta;
type Story = StoryObj<DataGridStoryProps>;

/**
 * Common configuration for DataGrid stories
 */
const baseStoryArgs = {
  ...commonStoryArgs,
};

/**
 * Default grid layout displaying user cards in a responsive grid
 */
export const Default: Story = {
  render: DataGridWithProvider,
  args: {
    ...baseStoryArgs,
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

