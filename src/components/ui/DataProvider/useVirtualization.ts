import * as React from "react";
import { useRef, useEffect, useCallback } from 'react';
import {
  useVirtualizer,
  useWindowVirtualizer,
} from "@tanstack/react-virtual";
import type { Row } from "@tanstack/react-table";
import type { DataTableProps } from "./DataProvider.interfaces"; // Use existing interface for props subset

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_OVERSCAN = 3;

// Define the props needed specifically for the virtualization hook
// We extract only the relevant props from DataTableProps
type UseVirtualizationProps<TData extends object> = Pick<
  DataTableProps<TData, object>, // Using object for TMeta as it's not relevant here
  'virtualizationMode' | 'virtualizationContainer' | 'rowHeight' | 'virtualizerOptions'
> & {
  rows: Row<TData>[];
  scrollElementRef: React.RefObject<HTMLDivElement>;
};

/**
 * Custom hook to encapsulate TanStack Virtual logic for the DataTable component.
 *
 * Responsibilities:
 * - Sets up `useVirtualizer` or `useWindowVirtualizer` based on props.
 * - Implements the `useRef` workaround for potential React memoization issues (see TanStack/virtual#743).
 * - Calculates necessary padding (`paddingTop`, `paddingBottom`) for maintaining layout in standard HTML tables.
 * - Provides a `getRowRef` callback for dynamic height measurement.
 *
 * @param props - Configuration options for virtualization.
 * @returns An object containing virtualization state and utilities needed by the DataTable.
 */
export function useVirtualization<TData extends object>({
  virtualizationMode = 'off',
  virtualizationContainer = 'table',
  rowHeight = DEFAULT_ROW_HEIGHT,
  virtualizerOptions,
  rows,
  scrollElementRef,
}: UseVirtualizationProps<TData>) {
  // --- Conditional Virtualizer Setup ---
  const isVirtualEnabled = virtualizationMode !== 'off';
  const isTableContainer = virtualizationContainer === 'table';
  const isWindowContainer = virtualizationContainer === 'window';

  // Static mode: Fixed height improves performance by avoiding measurements
  // Dynamic mode: Allows for variable row heights while maintaining smooth scrolling
  const { estimateSize: estimateSizeFn, overscan, ...restVirtualizerOptions } = virtualizerOptions || {};

  const estimateSize = useCallback(
    (index: number) => {
      if (virtualizationMode === 'static') return rowHeight;
      // Provide a sensible default if estimateSizeFn is missing in dynamic mode
      return estimateSizeFn?.(index) ?? DEFAULT_ROW_HEIGHT;
    },
    [virtualizationMode, rowHeight, estimateSizeFn]
  );

  const tableVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: estimateSize,
    overscan: overscan ?? DEFAULT_OVERSCAN,
    enabled: isVirtualEnabled && isTableContainer,
    ...restVirtualizerOptions,
  });

  const windowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: estimateSize,
    overscan: overscan ?? DEFAULT_OVERSCAN,
    enabled: isVirtualEnabled && isWindowContainer,
    scrollMargin: scrollElementRef.current?.offsetTop ?? 0,
    // Cast remaining options to 'any' to bypass strict type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(restVirtualizerOptions as any), // TODO: [cfviotti] Figure out how to avoid `any`
  });

  const rowVirtualizer = isWindowContainer ? windowVirtualizer : tableVirtualizer;

  // --- Workaround based on TanStack/virtual#743 ---
  // Store the virtualizer instance in a ref to potentially bypass React
  // memoization optimizations that might cause getVirtualItems() to return
  // stale or empty results. This fixes a `react-hooks/exhaustive-deps` error.
  const virtualizerRef = useRef(rowVirtualizer);
  // Ensure the ref is updated if the virtualizer instance changes
  useEffect(() => {
    virtualizerRef.current = rowVirtualizer;
  }, [rowVirtualizer]);
  // --- End Workaround ---

  // Access virtual items via the ref
  const virtualItems = isVirtualEnabled ? virtualizerRef.current.getVirtualItems() : [];

  // Calculate "padding" for `<tr>` spacer elements to maintain table
  // height and scroll position. This is necessary because regular HTML
  // tables can't use the more common `position: absolute` + `transform`
  // approach, due to several rendering limitations and CSS properties
  // compatibility on them.
  let paddingTop = 0;
  let paddingBottom = 0;

  if (isVirtualEnabled && virtualItems.length > 0) {
    const totalSize = virtualizerRef.current.getTotalSize(); // Access via ref
    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrollMargin = (virtualizerRef.current.options as any).scrollMargin ?? 0; // Access via ref - TODO: [cfviotti] Figure out how to avoid `any`

    // Top padding accounts for rows above the first visible item
    paddingTop = Math.max(0, firstItem.start - scrollMargin);
    // Bottom padding accounts for rows below the last visible item
    paddingBottom = Math.max(0, totalSize - lastItem.end);
  }

  const getRowRef = useCallback((node: HTMLTableRowElement | null) => {
    // Measure element using the virtualizer from the ref only in dynamic mode
    if (virtualizationMode === 'dynamic' && isVirtualEnabled && node) {
      virtualizerRef.current.measureElement(node);
    }
  // Depend on virtualizationMode and isVirtualEnabled. Ref access doesn't need dependency.
  }, [virtualizationMode, isVirtualEnabled]);

  // Return values needed by DataTable for rendering
  return {
    isVirtualEnabled,
    virtualItems,
    paddingTop,
    paddingBottom,
    getRowRef,
  };
}