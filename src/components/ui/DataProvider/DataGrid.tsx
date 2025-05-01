import * as React from "react";
import { type Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useData } from "./DataProviderContext";
import { type DataGridProps } from "./DataProvider.interfaces";

/**
 * Renders data provided by DataProvider in a responsive grid layout.
 * Uses a custom `renderItem` function to allow flexible rendering of each data item.
 * Ideal for displaying card-like elements or other non-tabular data representations.
 */
export const DataGrid = React.forwardRef(
  <TData extends object>(
    { renderItem, children, className, ...props }: DataGridProps<TData>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const { table } = useData<TData>();

    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4",
          className
        )}
        {...props}
      >
        {children}
        {table.getRowModel().rows.map((row: Row<TData>) => renderItem(row.original))}
      </div>
    );
  }
);
DataGrid.displayName = "DataGrid";