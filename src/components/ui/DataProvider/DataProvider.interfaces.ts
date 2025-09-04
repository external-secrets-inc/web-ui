import { type ColumnDef, type SortingState, type TableOptions, type Table as ReactTableType, type ColumnSizingState, type RowData, ColumnFiltersState } from "@tanstack/react-table";
import * as React from "react";
import { type VirtualizerOptions } from "@tanstack/react-virtual";

/**
 * Determines how row virtualization behaves in terms of height calculation and measurement.
 * 'dynamic' requires runtime measurement of actual row heights.
 */
export type VirtualizationMode = 'off' | 'static' | 'dynamic';

/**
 * Defines what element acts as the scrollable viewport for virtualization.
 * Custom selectors can be provided to target specific container elements.
 */
export type VirtualizationContainer = 'table' | 'window' | string;

/**
 * Base requirement for all data items in the table.
 * Each item must have a unique identifier.
 */
export type WithId = { id: string | number };

/**
 * Configuration for table sorting.
 */
export type SortConfig = { id: string; desc: boolean };

/**
 * Internal table state representation.
 * Generic type allows React Table to maintain type safety.
 */
export type TableState<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  sorting: SortingState;
  globalFilter: string;
  columnSizing: ColumnSizingState;
  columnFilters: ColumnFiltersState;
  isLoading?: boolean;
  emptyMessage: React.ReactNode;
};

/**
 * Actions available to modify table state.
 */
export type TableActions = {
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
};

/**
 * Configuration options for the DataProvider hook and component, excluding children.
 * Generic type is inferred from the data and columns props.
 */
export type ProviderConfig<TData extends RowData> = {
  /**
   * Array of data items to display
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#data Data API}
   */
  data: TData[];
  /**
   * Column definitions for the table. Memoizing this array is recomended by
   * react-table.
   * You also must use `tanstack-table` column definitions for it to properly work.
   * `createColumnHelper` is your friend.
   * @see
   * {@link https://tanstack.com/table/v8/docs/api/core/table#columns Column API}
   */
  columns: ColumnDef<TData, unknown>[];
  /**
   * Initial sort configuration for defining which column to sort by and in which direction when first rendering the table
   * @default { id: 'id', desc: false }
   */
  initialSort?: SortConfig;
  /** Loading state that shows an inner spinner when true */
  isLoading?: boolean;
  /**
   * Custom message to display when there is no data
   * Useful for providing more user-friendly empty state messages based on
   * current data type and context
   * @default "No data available"
   */
  emptyMessage?: React.ReactNode;
  /**
   * Function to get unique row identifier.
   * If not provided, data items must have an 'id' property.
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#getrowid GetRowId API}
   */
  getRowId?: TableOptions<TData>['getRowId'];
  /**
   * Metadata object passed down to cell/header renderers.
   * Commonly used for row actions, shared functions, or contextual data that cells need access to.
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#meta Table Meta API}
   */
  meta?: unknown;
  /**
   * Additional options passed directly to the underlying TanStack Table instance.
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#options Table Options API}
   */
  tableOptions?: Omit<
    TableOptions<TData>,
    | 'data'
    | 'columns'
    | 'getCoreRowModel'
    | 'getSortedRowModel'
    | 'getFilteredRowModel'
    | 'getRowId'
    | 'state'
    | 'onSortingChange'
    | 'onGlobalFilterChange'
    | 'onColumnSizingChange'
    | 'columnResizeMode'
    | 'meta'
  >;
};

/**
 * Props for the DataProvider component, including children.
 * Generic type is inferred from the config props.
 */
export type DataProviderProps<TData extends RowData> = ProviderConfig<TData> & {
  /**
   * Children to render inside the DataProvider. Usually a `DataTable` or `DataGrid` component,
   * but can be anything your heart desires. That's the beauty of `tanstack-table` headless nature.
   */
  children: React.ReactNode;
};

/**
 * Combined type for all values provided by the DataProvider context.
 * Generic type maintains type safety throughout the component tree.
 */
export type ProviderContextValue<TData extends RowData> = TableState<TData> &
  TableActions & {
    table: ReactTableType<TData>;
  };

/**
 * Props for the DataGrid component.
 * Generic type is inferred from the context.
 */
export interface DataGridProps<TData extends RowData> {
  /** Function to render each individual item in the grid */
  renderItem: (item: TData) => React.ReactNode;
  /** Optional content that will render before the grid items */
  children?: React.ReactNode;
  /** Optional class name for the grid container */
  className?: string;
}

/**
 * Props for the DataTable component.
 * Generic type is inferred from the context.
 */
export interface DataTableProps<TData extends RowData> {
  /** Optional class name for the Table root element */
  className?: string;
  /** Optional style for the Table root element */
  style?: React.CSSProperties;
  /** Callback function when a row is clicked */
  onRowClick?: (rowData: TData) => void;
  /** Custom elements to append after the data rows (not virtualized) */
  rowsAppend?: React.ReactNode;
  /**
   * Determines the row height strategy for virtualization.
   * - 'off': Disables virtualization.
   * - 'static': Assumes all rows have the same fixed height (`rowHeight` prop is required).
   * - 'dynamic': Rows can have variable heights, measured dynamically. Requires `virtualizerOptions.estimateSize`.
   * @default 'off'
   */
  virtualizationMode?: VirtualizationMode;

  /**
   * Determines the scrollable container for virtualization.
   * - 'table': The scrolling happens within the table element itself (requires height and overflow CSS).
   * - 'window': The browser window is the scroll container. The table component will not be intrinsically scrollable.
   * @default 'table'
   */
  virtualizationContainer?: VirtualizationContainer;

  /**
   * The fixed height (in pixels) for each row when `virtualizationMode` is 'static'.
   * Required if `virtualizationMode` is 'static'.
   */
  rowHeight?: number;

  /**
   * Advanced options passed directly to the underlying `useVirtualizer` or `useWindowVirtualizer` hook.
   * `estimateSize` is required when `virtualizationMode` is 'dynamic'.
   * `count`, `getScrollElement`, and `enabled` are managed internally by DataTable.
   */
  virtualizerOptions?: Partial<
    Omit<
      VirtualizerOptions<HTMLDivElement, Element>,
      'count' | 'getScrollElement' | 'enabled' | 'estimateSize' | 'scrollMargin'
    >
  > & {
    estimateSize?: (index: number) => number;
  };
}
