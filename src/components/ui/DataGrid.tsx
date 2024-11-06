import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, type SortingState, type OnChangeFn } from "@tanstack/react-table";
import { LucideArrowDownNarrowWide, LucideArrowUpNarrowWide, LucideSearch } from "lucide-react";

interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting: SortingState;
  globalFilter: string;
  onSortingChange: OnChangeFn<SortingState>;
  onGlobalFilterChange: (value: string) => void;
  renderItem: (item: TData, key: string) => React.ReactNode;
  newItem?: React.ReactNode;
}

function DataGrid<TData, TValue>({
  columns,
  data,
  sorting,
  globalFilter,
  onSortingChange,
  onGlobalFilterChange,
  renderItem,
  newItem
}: DataGridProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: onSortingChange,
    onGlobalFilterChange: onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  const sortableColumns = table.getAllColumns()
    .filter(col => col.getCanSort())
    .map(col => ({
      id: col.id,
      header: col.columnDef.header as string
    }));

  const currentSort = sorting[0] || { id: 'index', desc: true };

  const handleSortByChange = (columnId: string) => {
    onSortingChange(old => [{ id: columnId, desc: old[0]?.desc ?? false }]);
  };

  const handleSortDirectionChange = () => {
    onSortingChange(old => [{ ...old[0], desc: !old[0]?.desc }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-x-4 gap-y-2 flex-wrap">

        <div className="relative">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="max-w-48 pr-7"
          />
          <LucideSearch className="absolute inset-y-0 right-3 self-center text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1">
          <Select
            value={currentSort.id}
            onValueChange={handleSortByChange}
          >
            <SelectTrigger className="w-48 max-w-full">
              <SelectValue>
                <span className="text-muted-foreground">
                  Sort by {' '}
                </span>
                {sortableColumns.find(col => col.id === currentSort.id)?.header}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortableColumns.map((column) => (
                <SelectItem
                  key={column.id}
                  value={column.id}
                >
                  {column.header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="flex-none"
            variant="outline"
            size="icon"
            onClick={handleSortDirectionChange}
            aria-label={currentSort.desc ? 'Sort ascending' : 'Sort descending'}
            title={currentSort.desc ? 'Sort ascending' : 'Sort descending'}
          >
            {currentSort.desc ? <LucideArrowUpNarrowWide className="h-4 w-4" /> : <LucideArrowDownNarrowWide className="h-4 w-4" />}
          </Button>
        </div>

      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4">
        {newItem}
        {table.getRowModel().rows.map((row) =>
          renderItem(row.original, row.id)
        )}
      </div>
    </div>
  );
}

export default DataGrid;
