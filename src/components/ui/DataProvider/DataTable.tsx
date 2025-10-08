import {
  type ForwardedRef,
  type RefObject,
  forwardRef,
  useRef,
  useState,
  useEffect,
} from "react";
import { flexRender } from "@tanstack/react-table";
import { type RowData } from "@tanstack/react-table";
import {
  LucideArrowDown,
  LucideArrowUp,
  LucideChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData } from "./DataProviderContext";
import { type DataTableProps } from "./DataProvider.interfaces";
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
export const DataTable = forwardRef(
  <TData extends RowData>(
    {
      className,
      onRowClick,
      rowsAppend,
      style,
      virtualizationMode = "off",
      virtualizationContainer = "table",
      rowHeight = 40,
      virtualizerOptions,
      flashRowId,
      onFlashComplete,
    }: DataTableProps<TData>,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { table, isLoading, emptyMessage } = useData<TData>();
    const [flashingRowId, setFlashingRowId] = useState<string | null>(
      null
    );
    const flashingRowRef = useRef<HTMLTableRowElement | null>(null);
    const internalScrollElementRef = useRef<HTMLDivElement>(null);
    const scrollElementRef = (ref ||
      internalScrollElementRef) as RefObject<HTMLDivElement>;

    useEffect(() => {
      if (flashRowId) {
        setFlashingRowId(flashRowId);
        const timer = setTimeout(() => {
          setFlashingRowId(null);
          onFlashComplete?.();
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [flashRowId, onFlashComplete]);

    useEffect(() => {
      if (flashingRowId && flashingRowRef.current) {
        const scrollTimer = setTimeout(() => {
          flashingRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

        return () => clearTimeout(scrollTimer);
      }
    }, [flashingRowId]);

    const rows = table.getRowModel().rows;
    const columns = table.getAllColumns();
    const headerGroups = table.getHeaderGroups();

    const {
      isVirtualEnabled,
      virtualItems,
      paddingTop,
      paddingBottom,
      measureElementRefCallback,
      isWindowContainer,
      isSelectorContainer,
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
        className={cn(
          (isWindowContainer || isSelectorContainer) &&
            "[&_[data-radix-scroll-area-viewport]]:!overflow-clip block",
          "[&_[data-radix-scroll-area-viewport]]:min-w-fit",
          "[&_[data-radix-scroll-area-content]]:min-w-fit",
          "min-w-fit",
          className
        )}
        style={style}
      >
        <TableHeader
          className={cn(
            // Conditional class for window scrolling offset and pseudo-element
            // for background, border, shadow, and clipping for proper border
            // radius on table elements while avoiding showing rows moving below
            // the header
            (isWindowContainer || isSelectorContainer) &&
              `
              top-[--virtual-container-header-offset] [&>tr]:border-none [&_th]:bg-transparent
              before:shadow-[0_0_0_var(--virtual-container-header-offset)_theme(colors.background)]
              [clip-path:inset(calc(var(--virtual-container-header-offset)*-1)_0px_0px_0px)]
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <div className="w-4 h-4">
                        {header.column.getIsSorted() === "asc" ? (
                          <LucideArrowDown className="h-4 w-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
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
                <div className="flex justify-center items-center h-10">
                  <Loader />
                </div>
              </TableCell>
            </TableRow>
          ) : showEmpty ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex justify-center items-center h-10">
                  <div className="text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : isVirtualEnabled ? (
            <>
              {/* Spacer rows maintain table height and scroll position without breaking table semantics */}
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: `${paddingTop}px`, padding: 0, border: 0 }}
                  />
                </TableRow>
              )}
              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    ref={measureElementRefCallback}
                    data-index={virtualRow.index}
                    data-row-id={row.id}
                    style={{
                      height:
                        virtualizationMode === "static" ? rowHeight : undefined,
                    }}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      onRowClick && "cursor-pointer [&:not(:has(button:hover,a:hover))]:hover:bg-muted/50",
                      flashingRowId === row.id && "animate-flash-pulse"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        style={{ width: cell.column.getSize() }}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{
                      height: `${paddingBottom}px`,
                      padding: 0,
                      border: 0,
                    }}
                  />
                </TableRow>
              )}
            </>
          ) : (
            // Non-virtualized rendering
            <>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-row-id={row.id}
                  ref={flashingRowId === row.id ? flashingRowRef : null}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick && "cursor-pointer [&:not(:has(button:hover,a:hover))]:hover:bg-muted/50",
                    flashingRowId === row.id && "animate-flash-pulse"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      style={{ width: cell.column.getSize() }}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
