import {
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';

/**
 * Callback function that builds column definitions using the TanStack Table helper.
 * Returns an immutable array that may contain columns with various value types.
 */
type DefineColumnsCallback<TData extends RowData> = (
  helper: ReturnType<typeof createColumnHelper<TData>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => ReadonlyArray<ColumnDef<TData, any>>; // Reverted back to 'any'

/**
 * The type expected by DataProvider components for column definitions.
 */
type DataProviderColumns<TData extends RowData> = ColumnDef<TData, unknown>[];

/**
 * Utility to define columns for DataProvider, ensuring type safety via the TanStack Table helper
 * while guaranteeing the output array type matches DataProvider's expected ColumnDef<TData, unknown>[].
 * This avoids the need for consumers to manually cast the columns array.
 *
 * @template TData The row data type.
 * @param callback A function that receives the TanStack Table column helper and returns an array of column definitions.
 * @returns The column definitions array, typed as ColumnDef<TData, unknown>[] for compatibility.
 */
export function defineColumns<TData extends RowData>(
  callback: DefineColumnsCallback<TData>
): DataProviderColumns<TData> {
  const helper = createColumnHelper<TData>();
  const columns = callback(helper);

  return columns as DataProviderColumns<TData>;
}