import { type ColumnDef } from '@tanstack/react-table';
import { defineColumns } from '../DataProvider.utils';
import React from 'react';
import { type Row } from '@tanstack/react-table';
import type { ProviderConfig } from '../DataProvider.interfaces';

/**
 * Common user type for demonstration purposes in stories
 */
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

/**
 * Generates a dataset of mock users
 */
export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i+1}@example.com`,
    role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'Viewer'
  }));
}

/**
 * Common small dataset for non-virtualized examples
 */
export const mockUsers = generateUsers(5);

/**
 * Large dataset for virtualization examples
 */
export const largeDataset = generateUsers(200);

/**
 * Standard column definitions for user data
 */
export const userColumns = defineColumns<User>(helper => [
  helper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
    enableSorting: true
  }),
  helper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
    enableSorting: true
  }),
  helper.accessor('role', {
    header: 'Role',
    cell: info => info.getValue(),
    enableSorting: true
  }),
]);

/**
 * User columns with an additional actions column
 */
export function createColumnsWithActions(renderRowActions: (row: User) => React.ReactNode): ColumnDef<User, unknown>[] {
  return defineColumns<User>(helper => [
    ...userColumns,
    helper.display({
      id: 'actions',
      cell: (props: { row: Row<User> }) => {
        return React.createElement(
          'div',
          { className: 'flex justify-end' },
          renderRowActions(props.row.original)
        );
      }
    })
  ]);
}

/**
 * Standard base configuration for story args, reusable across all story files
 */
export const commonStoryArgs = {
  data: mockUsers,
  columns: userColumns,
  initialSort: { id: 'name', desc: false },
};

/**
 * Base configuration for virtualization story args
 */
export const baseVirtualizationArgs = {
  ...commonStoryArgs,
  data: largeDataset,
  rowHeight: 48,
};

/**
 * Common provider configuration type for DataProvider story components
 */
export type CommonStoryProps<T extends User = User> =
  Pick<ProviderConfig<T>, 'data' | 'columns' | 'initialSort' | 'getRowId'>;