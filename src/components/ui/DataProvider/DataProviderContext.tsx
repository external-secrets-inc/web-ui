import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnSizingState,
  type RowData,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { type ProviderConfig, type DataProviderProps, type ProviderContextValue } from "./DataProvider.interfaces";

/**
 * Context for DataProvider values with proper null safety.
 * The type explicitly includes null to enforce provider requirement checking.
 */
const DataProviderContext = React.createContext<ProviderContextValue<RowData> | null>(null);

/**
 * Internal hook responsible for managing the core state and logic for the DataProvider.
 *
 * Responsibilities:
 * - Centralizes table state management
 * - Provides consistent interface for table operations
 * - Handles state synchronization between sorting, filtering, and column sizing
 * - Implements data validation and error handling
 *
 * @param config Configuration options including data, columns, initial sort, etc.
 * @returns A memoized context value containing table state, actions, and the react-table instance.
 */
function useDataProvider<TData extends RowData>({
  data,
  columns,
  initialSort = { id: 'id', desc: false },
  getRowId,
  meta,
  tableOptions = {},
  isLoading = false,
  emptyMessage = "No data available"
}: ProviderConfig<TData>): ProviderContextValue<TData> {
  // Separate state hooks enable independent updates and granular memoization
  const [sorting, setSorting] = React.useState<SortingState>([initialSort]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Data validation in useMemo prevents unnecessary re-renders and provides early error detection
  const safeData = React.useMemo((): TData[] => {
    if (!Array.isArray(data)) {
      console.error('[DataProvider] Expected data to be an array but received:', data, `(Type: ${typeof data})`);
      return [] as TData[];
    }
    if (!getRowId && data.length > 0) {
      // Check for id property in a type-safe way
      const firstRow = data[0];
      if (typeof firstRow === 'object' && firstRow !== null && !('id' in firstRow)) {
        console.error('[DataProvider] Data items must have an "id" property, or provide a getRowId function.');
      }
    }
    return data ?? ([] as TData[]);
  }, [data, getRowId]);

  // Create the table instance with proper typing (fucking finally, it seems)
  const table = useReactTable<TData>({
    data: safeData,
    columns,
    state: { sorting, globalFilter, columnSizing, columnFilters },
    enableSortingRemoval: false,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(getRowId ? { getRowId } : {}),
    ...(meta ? { meta } : {}),
    ...tableOptions
  });

  return React.useMemo(() => ({
    data: safeData,
    columns,
    sorting,
    globalFilter,
    columnSizing,
    columnFilters,
    isLoading,
    emptyMessage,
    setSorting,
    setGlobalFilter,
    setColumnSizing,
    setColumnFilters,
    table
  }), [safeData, columns, sorting, globalFilter, columnSizing, columnFilters, setColumnSizing, isLoading, emptyMessage, table]);
}

/**
 * Provider component that makes react-table functionality available to children.
 * Uses the `useDataProvider` hook to create the context value.
 * Generic type is inferred from the data and columns props.
 *
 * @param props Configuration options and children components.
 */
export function DataProvider<TData extends RowData>({
  children,
  ...config
}: DataProviderProps<TData>) {
  const contextValue = useDataProvider<TData>(config);
  return (
    <DataProviderContext.Provider value={contextValue as unknown as ProviderContextValue<RowData>}>
      {children}
    </DataProviderContext.Provider>
  );
}

/**
 * Custom hook to consume the DataProvider context.
 * Provides typed access to the table state, actions, and instance.
 * Generic type is inferred from usage context.
 *
 * @returns The context value with proper typing inferred from usage.
 * @throws Error If used outside of a `DataProvider` component.
 */
export function useData<TData extends RowData>(): ProviderContextValue<TData> {
  const context = React.useContext(DataProviderContext);
  if (context === null) {
    throw new Error("useData must be used within a DataProvider");
  }
  // This cast is justified because the DataProvider ensures type consistency
  return context as unknown as ProviderContextValue<TData>;
}
