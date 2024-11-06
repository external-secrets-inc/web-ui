import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState
} from "@tanstack/react-table";

interface UseFeatureTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export default function useFeatureTable<TData, TValue>({
  data,
  columns
}: UseFeatureTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'index',
    desc: false
  }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  return {
    table,
    sorting,
    globalFilter,
    setSorting,
    setGlobalFilter,
  };
}
