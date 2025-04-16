// TODO[cfviotti]: Find a better pattern to abstract into multiple files (unlike our ui/shadcn's pattern), because it's getting unwieldy

import { cn } from "@/lib/utils"
import { type ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type SortingState, useReactTable, type TableOptions } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { LucideArrowDown, LucideArrowDownNarrowWide, LucideArrowUp, LucideArrowUpNarrowWide, LucideChevronsUpDown, LucideSearch } from "lucide-react"
import * as React from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Loader } from "@/components/ui/Loader"

/**
 * Base requirement for all data items in the table.
 * Each item must have a unique identifier for React's key prop and sorting
 * functionality. react-table will automatically use the index if no id is
 * provided, but we decided to enforce it for safety.
 *
 * You can use `getRowId` to customize to another identifier if needed.
 */
type WithId = { id: string | number }

/**
 * Configuration for table sorting.
 * @property id - Column identifier to sort by
 * @property desc - Sort direction (true for descending, false for ascending)
 */
type SortConfig = { id: string; desc: boolean }

/**
 * Internal table state that represents the current view.
 * Combines data, display configuration and filtering/sorting state.
 * @template TData - Type of data items being displayed
 */
type TableState<TData> = {
  data: TData[]
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any
  sorting: SortingState
  globalFilter: string
  isLoading?: boolean
  emptyMessage: React.ReactNode
}

/**
 * Actions available to modify table state.
 * These are separated from state to make the interface more explicit.
 */
type TableActions = {
  setSorting: (sorting: SortingState) => void
  setGlobalFilter: (value: string) => void
}

/**
 * Configuration options for the DataProvider.
 * @template TData - Type of data items being displayed
 */
export type ProviderConfig<TData extends object> = {
  /**
   * Array of data items to display
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#data Data API}
   */
  data: TData[]

  /**
   * Column definitions for the table. Memoizing this array is recomended by
   * react-table.
   * You also must use `tanstack-table` column definitions for it to properly work.
   * `createColumnHelper` is your friend.
   * @see
   * {@link https://tanstack.com/table/v8/docs/api/core/table#columns Column API}
   */
  columns: ColumnDef<TData, any>[] // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Initial sort configuration for defining which column to sort by and in which direction when first rendering the table
   * @default{ id: 'id', desc: false }
   */
  initialSort?: SortConfig

  /** Loading state that shows an inner spinner when true */
  isLoading?: boolean

  /**
   * Custom message to display when there is no data
   * Useful for providing more user-friendly empty state messages based on
   * current data type and context
   * @default "No data available"
   */
  emptyMessage?: React.ReactNode

  /**
   * Function to get unique row identifier.
   * If not provided, data items must have an 'id' property.
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#getrowid GetRowId API}
   */
  getRowId?: ((row: TData) => string) | undefined

  /**
   * Configuration options from `@tanstack/react-table`
   * @see {@link https://tanstack.com/table/v8/docs/api/core/table#options Table Options API}
   */
  tableOptions?: Omit<TableOptions<TData>,
    // Omit explicit user table options we already defined as props
    | 'data'
    | 'columns'
    | 'getCoreRowModel'
    | 'getSortedRowModel'
    | 'getFilteredRowModel'
    | 'getRowId'
    | 'state'
    | 'onSortingChange'
    | 'onGlobalFilterChange'
  >

  /**
   * Children to render inside the DataProvider. Usually a `DataTable` or `DataGrid` component, but can be anything your heart desires. That's the beauty of `tanstack-table` headless nature.
   */
  children: React.ReactNode

} & (
  | { getRowId: (row: TData) => string }
  | { data: Array<TData & WithId> }
)

/**
 * Combined type for all values provided by the DataProvider context.
 * Merges state, actions and the table instance for full control.
 */
type ProviderContextValue<TData extends object> = TableState<TData> &
  TableActions & {
    table: ReturnType<typeof useReactTable<TData>>
  }

/**
 * Stable default values to help prevent unnecessary re-renders and provide
 * consistent fallbacks.
 */
const DEFAULTS = {
  /** Empty array used as fallback when data is invalid */
  empty: [] as never[],

  /** Default sort configuration targeting required 'id' column */
  sort: { id: 'id', desc: false } as const,

  /** Initial empty filter string */
  filter: ''
} as const;

// Context
const DataProviderContext = React.createContext<ProviderContextValue<object>>({} as ProviderContextValue<object>)

/**
 * Custom hook that manages table state and configuration from a single source.
 * Handles data validation, sorting, filtering, and table instance creation.
 *
 * @template TData - Type of data items being displayed
 * @param config - Configuration options for the table
 * @returns Memoized context value with state, actions and table instance
 */
function useDataProvider<TData extends object>({
  data,
  columns,
  initialSort = DEFAULTS.sort,
  getRowId,
  tableOptions = {},
  isLoading = false,
  emptyMessage = "No data available"
}: ProviderConfig<TData>) {
  // State
  const [sorting, setSorting] = React.useState<SortingState>([initialSort])
  const [globalFilter, setGlobalFilter] = React.useState(DEFAULTS.filter)

  /**
   * Safe data with error reporting
   * Memoized to prevent unnecessary re-renders and potential infinite loops
   * @see https://github.com/TanStack/table/issues/4240
   */
  const safeData = React.useMemo((): TData[] => {
    if (data === undefined || data === null) {
      console.error(
        '[DataProvider] Data is required but received:',
        data,
      );
      return DEFAULTS.empty as TData[];
    }

    if (!Array.isArray(data)) {
      console.error(
        '[DataProvider] Expected data to be an array but received:',
        data,
        `(Type: ${typeof data})`
      );
      return DEFAULTS.empty as TData[];
    }

    // Validate if row id exists when getRowId is not provided
    if (!getRowId && data.length > 0 && !('id' in data[0])) {
      console.error('[DataProvider] Data items must have an "id" property, or provide a getRowId function passing an existing unique property. eg: getRowId={(row) => row.myUniqueExistingId}');
    }

    return data;
  }, [data, getRowId]);

  // Table instance
  const table = useReactTable<TData>({
    data: safeData,
    columns,
    state: { sorting, globalFilter },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(getRowId ? { getRowId } : {}),
    ...tableOptions
  })

  // Memoized to prevent unnecessary re-renders and potential infinite loops
  return React.useMemo(() => ({
    // State
    data: safeData,
    columns,
    sorting,
    globalFilter,
    isLoading,
    emptyMessage,
    // Actions
    setSorting,
    setGlobalFilter,
    // Table
    table
  }), [safeData, columns, sorting, globalFilter, table, isLoading, emptyMessage]) // Only add State and Table as dependencies
}

/**
 * Provider component that makes react-table functionality available to
 * children.
 * Can be used to create custom data grids, tables, and other data-driven
 * components as its children.
 */
function DataProvider<TData extends object>({
  children,
  ...config
}: ProviderConfig<TData> & { children: React.ReactNode }) {
  return (
    <DataProviderContext.Provider
      value={useDataProvider(config as ProviderConfig<TData>) as unknown as ProviderContextValue<object>} // TODO[cfviotti]: Fix type assertion (and every other `any` that's here. PS: It's harder than it looks)
    >
      {children}
    </DataProviderContext.Provider>
  )
}

/**
 * Search component that provides global text filtering functionality.
 * Renders an input field with search icon that filters across all table data.
 */
const DataSearch = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { globalFilter, setGlobalFilter } = React.useContext(DataProviderContext)

    return (
      <div
        className={cn("rounded-md border", className)}
        {...props}
        ref={ref}
      >
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-48 pr-7"
        />
        <LucideSearch className="absolute inset-y-0 right-3 self-center text-muted-foreground" />
      </div>
    )
})
DataSearch.displayName = "DataSearch"

/**
 * Sort control component that provides column sorting functionality.
 * Renders a select dropdown with sortable columns and a direction toggle button.
 * Allows users to choose which column to sort by and toggle ascending/descending.
 */
const DataSort = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { table, sorting, setSorting } = React.useContext(DataProviderContext)
    const currentSort = sorting[0]

    const sortableColumns = table.getAllColumns()
      .filter(col => col.getCanSort())
      .map(col => ({
        id: col.id,
        header: col.columnDef.header as string
      }))

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        <Select
          value={currentSort?.id}
          onValueChange={(value) => setSorting([{ id: value, desc: currentSort?.desc ?? false }])}
        >
          <SelectTrigger className="w-48 max-w-full">
            <SelectValue>
              <span className="text-muted-foreground">Sort by </span>
              {sortableColumns.find(col => col.id === currentSort?.id)?.header}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortableColumns.map((column) => (
              <SelectItem key={column.id} value={column.id}>{column.header}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSorting([{ ...currentSort, desc: !currentSort?.desc }])}
        >
          {currentSort?.desc ?
            <LucideArrowUpNarrowWide className="h-4 w-4" /> :
            <LucideArrowDownNarrowWide className="h-4 w-4" />
          }
        </Button>
      </div>
    )
  }
)
DataSort.displayName = "DataSort"

/**
 * Props for the DataGrid component
 */
interface DataGridProps {
  /** Function to render each individual item in the grid */
  renderItem: (item: any) => React.ReactNode // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Optional content that will render before the grid items */
  children?: React.ReactNode
  /** Optional className for styling */
  className?: string
}

/**
 * Grid layout component that renders table data in a responsive grid format.
 * It is agnostic in how the data is rendered, using a custom renderItem function.
 */
const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps>(
  ({ renderItem, children, className, ...props }, ref) => {
    const { table } = React.useContext(DataProviderContext)

    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4", className)}
        {...props}
      >
        {/* Render any additional content before the items using children*/}
        {children}
        {table.getRowModel().rows.map((row) => renderItem(row.original))}
      </div>
    )
})
DataGrid.displayName = "DataGrid"

/**
 * Props for the DataTable component
 */
interface DataTableProps<TMeta = any> extends React.HTMLAttributes<HTMLDivElement> { // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Optional function to handle row click events */
  onRowClick?: (row: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Optional content to append after the rows */
  rowsAppend?: React.ReactNode
  /** Optional metadata to pass to the table */
  meta?: TMeta
  /** Enable virtualization to only render visible rows (for large datasets) */
  virtualized?: boolean
  /** Estimated height of each row in pixels (for virtualization) */
  rowHeight?: number
  /** Number of extra rows to render above/below visible area (for virtualization) */
  overscanRows?: number
}

/**
 * Table component that renders data in a traditional table format.
 * Provides sorting, loading states, and empty states handling.
 * Supports row click handlers and additional metadata configuration for things
 * like custom actions within cells.
 */
const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, onRowClick, rowsAppend, meta, virtualized = false, rowHeight = 48, overscanRows = 10, ...props }, ref) => {
    const { table, isLoading, emptyMessage } = React.useContext(DataProviderContext)
    // Create a ref for the table container that will be used for both forwarding and virtualization
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    // Forward the ref to our internal ref
    React.useImperativeHandle(ref, () => tableContainerRef.current as HTMLDivElement);

    // Memoized to prevent unnecessary re-renders and potential infinite loops
    const tableOptions = React.useMemo(() => ({
      ...table.options,
      meta: meta ?? {}
    }), [meta, table.options]);

    table.setOptions(tableOptions);

    // We're using the existing tableContainerRef for scrolling

    // Create virtualizer with the table container as the scroll element
    const { rows } = table.getRowModel();
    const rowVirtualizer = virtualized ? useVirtualizer({
      count: rows.length,
      getScrollElement: () => tableContainerRef.current,
      estimateSize: () => rowHeight,
      overscan: overscanRows,
      getItemKey: (index) => rows[index]?.id || `row-${index}`,
      paddingStart: 48, // Add padding to prevent header overlap
      debug: false // Disable debug mode for production
    }) : null;

    // Force the virtualizer to update when the component mounts
    React.useEffect(() => {
      if (virtualized && rowVirtualizer) {
        // Add a CSS rule to handle virtualized rows
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          /* Table container styling */
          .virtualized-table-container {
            position: relative;
            border-radius: 0.5rem;
            max-height: 600px;
            overflow-y: auto;
          }

          /* Header styling */
          .virtualized-table-container thead {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: var(--background);
            border-bottom: 1px solid var(--border);
          }

          .virtualized-table-container thead th {
            background-color: var(--background);
            padding: 1rem;
            font-weight: 500;
          }

          /* No margin needed with paddingStart */

          /* Virtualized row styling */
          .virtualized-row {
            position: absolute;
            width: 100%;
            left: 0;
            top: 0;
            display: flex;
            align-items: center;
            border-bottom: 10px solid var(--border);
            transition: background-color 0.15s ease;
            background-color: var(--background);
          }


          .virtualized-row .virtual-cell {
            padding: 1rem;
            vertical-align: middle;
            height: 100%;
            border-right: 1px solid var(--border);
          }

          .virtualized-row .virtual-cell:last-child {
            border-right: none;
          }

          .virtualized-row:hover {
            background-color: hsl(var(--muted) / 0.5) !important;
            cursor: pointer;
          }
        `;
        document.head.appendChild(styleEl);

        // Force a recalculation of the virtualizer
        const timer = setTimeout(() => {
          rowVirtualizer.measure();
        }, 100);

        return () => {
          clearTimeout(timer);
          document.head.removeChild(styleEl);
        };
      }
    }, [virtualized, rowVirtualizer]);

    // Set up the table for virtualization
    React.useEffect(() => {
      if (virtualized) {
        // Enable column sizing and resizing
        table.setColumnSizing({});

        // Force a re-render after a short delay to ensure proper column widths
        const timer = setTimeout(() => {
          table.setColumnSizing({...table.getState().columnSizing});
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [table, virtualized]);

    // Store the current implementation for debugging purposes
    React.useEffect(() => {
      if (virtualized && rowVirtualizer) {
        // Add a class to the body to indicate virtualization is active
        document.body.classList.add('virtualized-table-active');
        return () => document.body.classList.remove('virtualized-table-active');
      }
    }, [virtualized, rowVirtualizer]);

    return (
      <div
        ref={tableContainerRef}
        className={cn("rounded-md border", virtualized && "virtualized-table-container", className)}
        {...props}
        style={{
          maxHeight: virtualized ? '600px' : 'auto',
          overflowY: virtualized ? 'auto' : 'visible'
        }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    data-column-id={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      header.column.getCanSort() && "cursor-pointer select-none",
                      "whitespace-nowrap"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="w-4 h-4">
                          {{
                            asc: <LucideArrowDown className="h-4 w-4" />,
                            desc: <LucideArrowUp className="h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <LucideChevronsUpDown className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            { isLoading ?
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex justify-center items-center h-5">
                    <Loader />
                  </div>
                </TableCell>
              </TableRow>

            : table?.getRowModel()?.rows?.length === 0 ?
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex justify-center items-center h-5">
                    <div className="text-sm text-muted-foreground">{emptyMessage}</div>
                  </div>
                </TableCell>
              </TableRow>

            : virtualized && rowVirtualizer ? (
                // Simplified virtualization approach
                <>

                  {/* Create a single spacer row that establishes the full height */}
                  <TableRow style={{ height: 0 }}>
                    <TableCell colSpan={table.getAllColumns().length} style={{ padding: 0, border: 'none' }}>
                      <div
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                          visibility: 'hidden',
                          position: 'relative',
                          paddingTop: '10px' // Add padding to prevent header overlap
                        }}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Only render the rows that are currently visible */}
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = rows[virtualRow.index];
                    if (!row) return null;

                    // Create a row for each visible item
                    return (
                      <TableRow
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        data-virtualrow="true"
                        onClick={() => onRowClick?.(row.original)}
                        className={cn(
                          "virtualized-row",
                          onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                        )}
                        style={{
                          height: rowHeight,
                          transform: `translateY(${virtualRow.start}px)`,
                          position: 'absolute',
                          width: '100%',
                          left: 0,
                          right: 0,
                          willChange: 'transform',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {row.getVisibleCells().map(cell => {
                          // Get column width from header
                          const columnId = cell.column.id;
                          const headerCell = document.querySelector(`th[data-column-id="${columnId}"]`);
                          const width = headerCell ? headerCell.getBoundingClientRect().width : 'auto';

                          return (
                            <TableCell
                              key={cell.id}
                              className="p-4 virtual-cell"
                              style={{
                                width: typeof width === 'number' ? `${width}px` : width,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                borderRight: '1px solid var(--border)'
                              }}
                              data-column-id={columnId}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {rowsAppend}
                  </>
              ) : (
                // Standard rendering for normal datasets
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(row.original)}
                      className={onRowClick && "cursor-pointer hover:bg-muted/50"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {rowsAppend}
                </>)
            }
          </TableBody>
        </Table>
      </div>
    )
})
DataTable.displayName = "DataTable"

export { DataGrid, DataProvider, DataSearch, DataSort, DataTable, useDataProvider }
