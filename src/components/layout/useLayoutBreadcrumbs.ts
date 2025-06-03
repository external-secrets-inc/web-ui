import {
  type LayoutBreadcrumbSegment,
  type LayoutSidebarNavigationItem,
  findPathRecursive,
  removeOrgPrefix,
  useLayoutNavigation,
} from "@/components/layout";
import useOrgLink from "@/hooks/useOrgLink";
import { useLocation } from "react-router-dom";

const ROOT_PATH = "/";

/**
 * Custom React hook that generates an array of breadcrumb segments based on the
 * current URL location and the application's navigation structure.
 *
 * It attempts to match the current path hierarchically within the navigation data
 * (derived from `navMain` and `navFooter`) using `findPathRecursive`. If no
 * hierarchical match is found, it falls back to attempting a direct match
 * for the current path against top-level navigation items.
 *
 * @returns An array of `LayoutBreadcrumbSegment` objects representing the
 *          breadcrumb trail for the current page. Returns an empty array if no
 *          matching path is found in the navigation structure.
 */
export function useLayoutBreadcrumbs(): LayoutBreadcrumbSegment[] {
  const location = useLocation();
  const getOrgLink = useOrgLink();
  const { navMain, navFooter } = useLayoutNavigation(getOrgLink);

  const pathWithoutOrg = removeOrgPrefix(location.pathname);

  const allNavItems: LayoutSidebarNavigationItem[] = [
    ...navMain,
    ...navFooter,
  ];

  let potentialSegments: LayoutBreadcrumbSegment[] | null = findPathRecursive(
    pathWithoutOrg,
    allNavItems,
    [],
    getOrgLink,
  );

  if (!potentialSegments || potentialSegments.length === 0) {
    // No hierarchical match, try direct match for non-root paths
    if (location.pathname !== getOrgLink(ROOT_PATH)) {
      const directMatch = allNavItems.find(
        (item) => item.url && getOrgLink(item.url) === location.pathname,
      );

      if (directMatch && directMatch.url) {
        // Found a direct match.
        potentialSegments = [
          {
            label: directMatch.label,
            path: getOrgLink(directMatch.url),
            navigatable: true,
          },
        ];
      }
    }
  }

  return potentialSegments || [];
}