import * as React from "react";
import { LucideArrowDownNarrowWide, LucideArrowUpNarrowWide } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "./DataProviderContext";

/**
 * Provides controls for sorting the data within a DataProvider context.
 * Allows selecting a column to sort by and toggling the sort direction (ascending/descending).
 * Interacts with the `sorting` state managed by the `useDataProvider` hook.
 */
export const DataSort = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { table, sorting, setSorting } = useData();
  const currentSort = sorting[0];

  const sortableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanSort())
    .map((col) => ({
      id: col.id,
      header: typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id,
    }));

  return (
    <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
      <Select
        value={currentSort?.id}
        onValueChange={(value) => setSorting([{ id: value, desc: currentSort?.desc ?? false }])}
      >
        <SelectTrigger className="w-48 max-w-full">
          <SelectValue>
            <span className="text-muted-foreground">Sort by </span>
            {sortableColumns.find((col) => col.id === currentSort?.id)?.header}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortableColumns.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              {column.header}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setSorting([{ ...currentSort, desc: !currentSort?.desc }])}
      >
        {currentSort?.desc ? (
          <LucideArrowUpNarrowWide className="h-4 w-4" />
        ) : (
          <LucideArrowDownNarrowWide className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});
DataSort.displayName = "DataSort";