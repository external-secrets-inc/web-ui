import type { LayoutSidebarNavigationItem } from "@/components/layout";
import { isSectionActive, navigationData } from "@/components/layout";
import { useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom React hook that provides access to navigation data and a utility function
 * to determine if a navigation section is currently active.
 *
 * @param getOrgLink - A function that takes a relative path string and returns
 *                     an organization-specific URL path. This is used to correctly
 *                     match routes against navigation items that might have org-prefixed URLs.
 * @returns An object containing:
 *  - `navMain`: An array of `LayoutSidebarNavigationItem` for the main navigation.
 *  - `navFooter`: An array of `LayoutSidebarNavigationItem` for the footer navigation.
 *  - `isSectionActive`: A memoized callback function that takes a `LayoutSidebarNavigationItem`
 *    and returns `true` if that item (or any of its children, or its `activePaths`)
 *    matches the current route, `false` otherwise.
 */
export function useLayoutNavigation(getOrgLink: (path: string) => string) {
  const location = useLocation();

  const checkSectionActive = useCallback(
    (item: LayoutSidebarNavigationItem): boolean => {
      return isSectionActive(location.pathname, getOrgLink, item);
    },
    [location.pathname, getOrgLink],
  );

  return {
    navMain: navigationData.navMain,
    navFooter: navigationData.navFooter,
    isSectionActive: checkSectionActive,
  };
}