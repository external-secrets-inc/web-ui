import * as React from "react";
import { useRef, useEffect, useCallback } from 'react';
import {
  useVirtualizer,
  useWindowVirtualizer,
} from "@tanstack/react-virtual";
import type { Row, RowData } from "@tanstack/react-table";
import type { DataTableProps } from "./DataProvider.interfaces"; // Use existing interface for props subset

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_OVERSCAN = 3;

/**
 * Workaround for potential React memoization issues with TanStack Virtual.
 * Stores the virtualizer instance in a ref and updates it via useEffect
 * to ensure `getVirtualItems()` uses the latest instance, potentially bypassing
 * optimizations that might cause stale results. See TanStack/virtual#743.
 * Also fixes related `react-hooks/exhaustive-deps` warnings.
 *
 * @param virtualizer The virtualizer instance from `useVirtualizer` or `useWindowVirtualizer`.
 * @returns A stable ref object containing the latest virtualizer instance.
 */
function useMemoizedVirtualizerRef<T>(virtualizer: T): React.MutableRefObject<T> {
  const virtualizerRef = useRef(virtualizer);
  useEffect(() => {
    virtualizerRef.current = virtualizer;
  }, [virtualizer]);
  return virtualizerRef;
}

// Define the props needed specifically for the virtualization hook
// We extract only the relevant props from DataTableProps
type UseVirtualizationProps<TData extends RowData> = Pick<
  DataTableProps<TData>,
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
export function useVirtualization<TData extends RowData>({
  virtualizationMode = 'off',
  virtualizationContainer = 'table',
  rowHeight = DEFAULT_ROW_HEIGHT,
  virtualizerOptions,
  rows,
  scrollElementRef,
}: UseVirtualizationProps<TData>) {
  const isVirtualEnabled = virtualizationMode !== 'off';
  const isTableContainer = virtualizationContainer === 'table';
  const isWindowContainer = virtualizationContainer === 'window';
  const isSelectorContainer = typeof virtualizationContainer === 'string' && !isTableContainer && !isWindowContainer;

  const { estimateSize: estimateSizeFn, overscan, ...restVirtualizerOptions } = virtualizerOptions || {};

  /**
   * Creates a size estimation function based on virtualization mode.
   * - Static mode: Returns fixed height for performance optimization.
   * - Dynamic mode: Uses provided estimateSizeFn or falls back to default.
   */
  const createSizeEstimator = useCallback(
    (index: number) => {
      if (virtualizationMode === 'static') return rowHeight;
      return estimateSizeFn?.(index) ?? DEFAULT_ROW_HEIGHT;
    },
    [virtualizationMode, rowHeight, estimateSizeFn]
  );

  const elementVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => {
      if (isSelectorContainer) {
        const element = document.querySelector(virtualizationContainer);
        if (!element || !(element instanceof HTMLDivElement)) {
          console.error(`[DataProvider] Selector "${virtualizationContainer}" did not match an HTMLDivElement`);
          return null;
        }
        return element;
      }
      return scrollElementRef.current;
    },
    estimateSize: createSizeEstimator,
    overscan: overscan ?? DEFAULT_OVERSCAN,
    enabled: isVirtualEnabled && (isTableContainer || isSelectorContainer),
    scrollMargin: isSelectorContainer ? (scrollElementRef.current?.offsetTop ?? 0) : undefined,
    ...restVirtualizerOptions,
  });

  const windowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: createSizeEstimator,
    overscan: overscan ?? DEFAULT_OVERSCAN,
    enabled: isVirtualEnabled && isWindowContainer,
    scrollMargin: scrollElementRef.current?.offsetTop ?? 0,
    // Skip the rest options from restVirtualizerOptions that might cause type issues
  });

  const rowVirtualizer = isWindowContainer ? windowVirtualizer : elementVirtualizer;

  // Use the memoized ref workaround
  const virtualizerRef = useMemoizedVirtualizerRef(rowVirtualizer);

  const virtualItems = isVirtualEnabled ? virtualizerRef.current.getVirtualItems() : [];

  let paddingTop = 0;
  let paddingBottom = 0;

  /**
   * Calculates the top and bottom padding required for spacer elements
   * when using virtualization within a standard HTML table.
   * This maintains layout integrity as rows scroll in and out of view.
   *
   * @param virtualItems - The current virtual items from the virtualizer.
   * @param totalSize - The total estimated size of all items.
   * @param scrollMargin - The scroll margin from the virtualizer options.
   * @returns An object with `paddingTop` and `paddingBottom` values.
   */
  function calculateVirtualPadding(virtualItems: ReturnType<typeof virtualizerRef.current.getVirtualItems>, totalSize: number, scrollMargin: number) {
    if (virtualItems.length === 0) {
      return { paddingTop: 0, paddingBottom: 0 };
    }

    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];

    const paddingTop = Math.max(0, firstItem.start - scrollMargin);
    const paddingBottom = Math.max(0, totalSize - lastItem.end);

    return { paddingTop, paddingBottom };
  }

  if (isVirtualEnabled && virtualItems.length > 0) {
    const totalSize = virtualizerRef.current.getTotalSize();
    const scrollMargin = typeof virtualizerRef.current.options.scrollMargin === 'number'
      ? virtualizerRef.current.options.scrollMargin
      : 0;

    // Calculate padding using the extracted helper function
    const calculatedPadding = calculateVirtualPadding(virtualItems, totalSize, scrollMargin);
    paddingTop = calculatedPadding.paddingTop;
    paddingBottom = calculatedPadding.paddingBottom;
  }

  const measureElementRefCallback = useCallback((node: HTMLTableRowElement | null) => {
    if (virtualizationMode === 'dynamic' && isVirtualEnabled && node) {
      virtualizerRef.current.measureElement(node);
    }
    // Depend on virtualizationMode and isVirtualEnabled. Ref access doesn't need dependency.
  }, [virtualizationMode, isVirtualEnabled, virtualizerRef]);

  return {
    isVirtualEnabled,
    virtualItems,
    paddingTop,
    paddingBottom,
    measureElementRefCallback,
    isTableContainer,
    isWindowContainer,
    isSelectorContainer,
  };
}