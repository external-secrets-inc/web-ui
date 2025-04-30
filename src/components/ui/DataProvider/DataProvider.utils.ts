import {
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';

// Define the type for the callback function the user will provide.
// It receives the helper and should return an array of ColumnDef objects.
// Using ReadonlyArray is good practice for inputs that shouldn't be mutated.
// The internal 'any' allows the callback to return an array containing
// ColumnDefs with different specific TValues (string, number, etc.) as produced
// by the createColumnHelper methods.
type DefineColumnsCallback<TData extends RowData> = (
  helper: ReturnType<typeof createColumnHelper<TData>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => ReadonlyArray<ColumnDef<TData, any>>; // Reverted back to 'any'


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
): ColumnDef<TData, unknown>[] {
  const helper = createColumnHelper<TData>();
  const columns = callback(helper);

  // Type assertion is necessary again to bridge the 'any' TValue from the callback's
  // return array type to the 'unknown' TValue required by DataProvider.
  return columns as ColumnDef<TData, unknown>[]; // Reinstated type assertion
}