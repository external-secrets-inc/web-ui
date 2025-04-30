import * as React from "react";
import {
  flexRender,
} from "@tanstack/react-table";
import { LucideArrowDown, LucideArrowUp, LucideChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useData } from "./DataProviderContext";
import {
  type DataTableProps,
} from "./DataProvider.interfaces";
import { useVirtualization } from "./useVirtualization";

/**
 * Renders data from DataProvider in a standard HTML table with advanced features.
 *
 * Features:
 * - Virtualization support (logic handled by useVirtualization hook)
 * - Flexible rendering modes (virtualized and non-virtualized)
 * - Integrated state management for sorting, filtering, and column sizing
 * - Support for both table-level and window-level scrolling
 */
export const DataTable = React.forwardRef(
  <TData extends object, TMeta extends object>(
    {
      className,
      onRowClick,
      rowsAppend,
      meta,
      style,
      virtualizationMode = 'off',
      virtualizationContainer = 'table',
      rowHeight = 40,
      virtualizerOptions,
    }: DataTableProps<TData, TMeta>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const { table, isLoading, emptyMessage } = useData<TData>();
    const internalScrollElementRef = React.useRef<HTMLDivElement>(null);
    const scrollElementRef = (ref || internalScrollElementRef) as React.RefObject<HTMLDivElement>;

    React.useEffect(() => {
      table.setOptions((prev) => ({
        ...prev,
        meta: { ...(prev.meta ?? {}), ...(meta ?? {}) },
      }));
    }, [meta, table]);

    const rows = table.getRowModel().rows;
    const columns = table.getAllColumns();
    const headerGroups = table.getHeaderGroups();

    // Use the virtualization hook
    const {
      isVirtualEnabled,
      virtualItems,
      paddingTop,
      paddingBottom,
      getRowRef,
    } = useVirtualization({
      virtualizationMode,
      virtualizationContainer,
      rowHeight,
      virtualizerOptions,
      rows,
      scrollElementRef,
    });

    const showLoading = isLoading;
    const showEmpty = !isLoading && rows.length === 0;

    return (
      <Table
        ref={scrollElementRef}
        className={cn(virtualizationContainer === 'window' && "[overflow:unset] block", className)}
        style={style}
      >
        <TableHeader
          className={cn(
            // Base sticky header styles
            'sticky z-10 [&_tr]:border-b',
            // Conditional class for window scrolling offset and pseudo-element
            // for background, border, shadow, and clipping for proper border
            // radius on table elements while avoiding showing rows moving below
            // the header
            virtualizationContainer === 'window' && `
              top-[--window-container-header-offset]
              before:absolute before:inset-0 before:-m-px
              before:rounded-t-md before:shadow-[0_0_0_theme(spacing.12)_theme(colors.background)]
              before:-z-10 before:[clip-path:rect(calc(theme(spacing.3)*-1)_100%_100%_0%)]
              before:border before:border-border before:bg-background
            `
          )}
        >
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
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
                        {header.column.getIsSorted() === 'asc' ? (
                          <LucideArrowDown className="h-4 w-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <LucideArrowUp className="h-4 w-4" />
                        ) : (
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
          {showLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center items-center h-10"><Loader /></div>
              </TableCell>
            </TableRow>
          ) : showEmpty ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center items-center h-10">
                  <div className="text-sm text-muted-foreground">{emptyMessage}</div>
                </div>
              </TableCell>
            </TableRow>
          ) : isVirtualEnabled ? (
            <>
              {/* Spacer rows maintain table height and scroll position without breaking table semantics */}
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ height: `${paddingTop}px`, padding: 0, border: 0 }} />
                </TableRow>
              )}
              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    // The ref is passed to the useVirtualization hook.
                    // It's used internally by the hook to measure row heights
                    // when virtualizationMode is 'dynamic'.
                    ref={getRowRef}
                    data-index={virtualRow.index} // Keep data-index for debugging/styling
                    // Apply static height if needed
                    style={{ height: virtualizationMode === 'static' ? rowHeight : undefined }}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell style={{ width: cell.column.getSize() }} key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} />
                </TableRow>
              )}
            </>
          ) : (
            // Non-virtualized rendering
            <>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell style={{ width: cell.column.getSize() }} key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          )}
          {/* Always render rowsAppend at the end of the table body */}
          {/* Note: In virtualized mode, this appears *after* the bottom padding spacer. */}
          {/* Test if this impacts scroll height calculations negatively. */}
          {rowsAppend}
        </TableBody>
      </Table>
    );
  }
);
DataTable.displayName = "DataTable";