import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnSizingState,
} from "@tanstack/react-table";
import { type ProviderConfig, type DataProviderProps, type ProviderContextValue } from "./DataProvider.interfaces";

// Initialize context with `null` for type safety. The `useData` hook will
// handle checking for `null` and ensure the provider is present.
const DataProviderContext = React.createContext<ProviderContextValue<object> | null>(null);

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
 * @returns A memoized context value containing table state, actions, and the `react-table` instance.
 */
function useDataProvider<TData extends object>({
  data,
  columns,
  initialSort = { id: 'id', desc: false }, // Default sort configuration
  getRowId,
  tableOptions = {},
  isLoading = false,
  emptyMessage = "No data available" // Default empty message
}: ProviderConfig<TData>) {
  // Separate state hooks enable independent updates and granular memoization
  const [sorting, setSorting] = React.useState<SortingState>([initialSort]);
  const [globalFilter, setGlobalFilter] = React.useState(''); // Default filter state
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});

  // Data validation in useMemo prevents unnecessary re-renders and provides early error detection
  const safeData = React.useMemo((): TData[] => {
    if (!Array.isArray(data)) {
      console.error('[DataProvider] Expected data to be an array but received:', data, `(Type: ${typeof data})`);
      return [] as TData[]; // Return empty array directly
    }
    if (!getRowId && data.length > 0 && !('id' in data[0])) {
      console.error('[DataProvider] Data items must have an "id" property, or provide a getRowId function.');
    }
    return data ?? ([] as TData[]); // Return empty array directly if data is null/undefined
  }, [data, getRowId]);

  const table = useReactTable<TData>({
    data: safeData,
    columns,
    state: { sorting, globalFilter, columnSizing },
    enableSortingRemoval: false,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(getRowId ? { getRowId } : {}),
    ...tableOptions
  });

  return React.useMemo(() => ({
    data: safeData,
    columns,
    sorting,
    globalFilter,
    columnSizing,
    isLoading,
    emptyMessage,
    setSorting,
    setGlobalFilter,
    setColumnSizing,
    table
  }), [safeData, columns, sorting, globalFilter, columnSizing, setColumnSizing, isLoading, emptyMessage, table]);
}

/**
 * Provider component that makes react-table functionality available to children.
 * Uses the `useDataProvider` hook to create the context value.
 *
 * @param props Configuration options and children components.
 */
export function DataProvider<TData extends object>({
  children,
  ...config
}: DataProviderProps<TData>) {
  const contextValue = useDataProvider(config);
  return (
    <DataProviderContext.Provider value={contextValue as unknown as ProviderContextValue<object>}>
      {children}
    </DataProviderContext.Provider>
  );
}

/**
 * Custom hook to consume the DataProvider context.
 * Provides typed access to the table state, actions, and instance.
 *
 * @returns The context value for the specific `TData` type.
 * @throws Error If used outside of a `DataProvider` component.
 */
export function useData<TData extends object = object>(): ProviderContextValue<TData> {
  const context = React.useContext(DataProviderContext);
  if (context === null) {
    // Throw an error if the hook is used without a Provider parent
    throw new Error("useData must be used within a DataProvider");
  }
  // After the null check, TypeScript knows context is ProviderContextValue<object>.
  // We still need to cast the *generic* type TData for the consumer.
  // This is safe because the Provider ensures the context value matches the TData it was given.
  return context as unknown as ProviderContextValue<TData>;
}