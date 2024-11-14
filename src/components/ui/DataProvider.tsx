import { cn } from "@/lib/utils"
import { type ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, type SortingState, useReactTable } from "@tanstack/react-table"
import { LucideArrowDown, LucideArrowDownNarrowWide, LucideArrowUp, LucideArrowUpNarrowWide, LucideChevronsUpDown, LucideSearch } from "lucide-react"
import * as React from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

interface DataProviderContextValue<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
  table: ReturnType<typeof useReactTable>
}

const DataProviderContext = React.createContext<DataProviderContextValue<any>>({} as any)

interface DataWithId {
  id: string | number;
}

/**
 * DataProvider requires data with unique IDs for proper functioning.
 * Each item in the data array must have a unique 'id' property.
 */
interface DataProviderProps<TData extends DataWithId> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  children: React.ReactNode;
  initialSort?: { id: string; desc: boolean };
}

function DataProvider<TData extends DataWithId>({
  data,
  columns,
  children,
  initialSort = { id: 'id', desc: false }
}: DataProviderProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([initialSort])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <DataProviderContext.Provider value={{ data, columns, sorting, setSorting, globalFilter, setGlobalFilter, table }}>
      {children}
    </DataProviderContext.Provider>
  )
}

const DataSearch = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { globalFilter, setGlobalFilter } = React.useContext(DataProviderContext)

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
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
})
DataSort.displayName = "DataSort"

interface DataGridProps {
  renderItem: (item: any) => React.ReactNode
  children?: React.ReactNode
  className?: string
}

const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps>(
  ({ renderItem, children, className, ...props }, ref) => {
    const { table } = React.useContext(DataProviderContext)

    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4", className)}
        {...props}
      >
        {children}
        {table.getRowModel().rows.map((row) => renderItem(row.original))}
      </div>
    )
})
DataGrid.displayName = "DataGrid"

interface DataTableProps<TMeta = any> extends React.HTMLAttributes<HTMLDivElement> {
  onRowClick?: (row: any) => void;
  rowsAppend?: React.ReactNode;
  meta?: TMeta;
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, onRowClick, rowsAppend, meta, ...props }, ref) => {
    const { table } = React.useContext(DataProviderContext)

    const tableOptions = React.useMemo(() => ({
      ...table.options,
      meta: meta ?? {}
    }), [meta, table.options]);

    table.setOptions(tableOptions);

    return (
      <div ref={ref} className={cn("rounded-md border", className)} {...props}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() && "cursor-pointer select-none",
                      "whitespace-nowrap"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} onClick={() => onRowClick?.(row.original)} className="cursor-pointer">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rowsAppend}
          </TableBody>
        </Table>
      </div>
    )
})
DataTable.displayName = "DataTable"

export { DataGrid, DataProvider, DataSearch, DataSort, DataTable }
