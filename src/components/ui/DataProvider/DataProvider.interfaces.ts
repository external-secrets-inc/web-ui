import { type ColumnDef, type SortingState, type TableOptions, type Table as ReactTableType, type ColumnSizingState } from "@tanstack/react-table";
import * as React from "react";
import { type VirtualizerOptions } from "@tanstack/react-virtual";

/**
 * Defines the available modes for row virtualization.
 * - `off`: Virtualization is disabled.
 * - `dynamic`: Rows have variable heights, measured by the virtualizer.
 * - `static`: All rows have a fixed height specified by `rowHeight`.
 */
export type VirtualizationMode = 'off' | 'dynamic' | 'static';

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
 */
export type TableState<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  sorting: SortingState;
  globalFilter: string;
  columnSizing: ColumnSizingState;
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
};

/**
 * Configuration options for the DataProvider hook and component, excluding children.
 * @template TData - Type of data items being displayed
 */
export type ProviderConfig<TData extends object> = {
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
  getRowId?: ((row: TData) => string) | undefined;
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
    | 'onColumnSizingChange' // Added this since it's handled internally
    | 'columnResizeMode'     // Added this since it's handled internally
  >;
} & ({ getRowId: (row: TData) => string } | { data: Array<TData & WithId> });

/**
 * Props for the DataProvider component, including children.
 */
export type DataProviderProps<TData extends object> = ProviderConfig<TData> & {
  /**
   * Children to render inside the DataProvider. Usually a `DataTable` or `DataGrid` component,
   * but can be anything your heart desires. That's the beauty of `tanstack-table` headless nature.
   */
  children: React.ReactNode;
};

/**
 * Combined type for all values provided by the DataProvider context.
 */
export type ProviderContextValue<TData extends object> = TableState<TData> &
  TableActions & {
    table: ReactTableType<TData>;
  };

/**
 * Props for the DataGrid component.
 */
export interface DataGridProps<TData extends object = object> {
  /** Function to render each individual item in the grid */
  renderItem: (item: TData) => React.ReactNode;
  /** Optional content that will render before the grid items */
  children?: React.ReactNode;
  /** Optional class name for the grid container */
  className?: string;
}

/**
 * Props for the DataTable component.
 */
export interface DataTableProps<TData extends object, TMeta extends object> {
  /** Optional class name for the Table root element */
  className?: string;
  /** Optional style for the Table root element */
  style?: React.CSSProperties;
  /** Callback function when a row is clicked */
  onRowClick?: (rowData: TData) => void;
  /** Custom elements to append after the data rows (not virtualized) */
  rowsAppend?: React.ReactNode;
  /** Metadata object passed down to cell/header renderers */
  meta?: TMeta;

  // --- Virtualization Props ---

  /**
   * Determines the row height strategy for virtualization.
   * - 'off': Disables virtualization.
   * - 'static': Assumes all rows have the same fixed height (`rowHeight` prop is required).
   * - 'dynamic': Rows can have variable heights, measured dynamically. Requires `virtualizerOptions.estimateSize`.
   * @default 'off'
   */
  virtualizationMode?: 'off' | 'static' | 'dynamic';

  /**
   * Determines the scrollable container for virtualization.
   * - 'table': The scrolling happens within the table element itself (requires height and overflow CSS).
   * - 'window': The browser window is the scroll container. The table component will not be intrinsically scrollable.
   * @default 'table'
   */
  virtualizationContainer?: 'table' | 'window';

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