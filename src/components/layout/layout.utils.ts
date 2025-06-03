import type { LayoutSidebarNavigationItem, LayoutBreadcrumbSegment } from "@/components/layout";

/**
 * Checks if a navigation item or any of its children match the current path,
 * indicating that the section should be considered active.
 *
 * @param currentPath - The current URL path.
 * @param orgLinkResolver - A function that resolves a relative path to an organization-specific path.
 * @param item - The navigation item to check.
 * @returns True if the item or its children are active, false otherwise.
 */
export function isSectionActive(
  currentPath: string,
  orgLinkResolver: (path: string) => string,
  item: LayoutSidebarNavigationItem
): boolean {
  if (item.url && !item.isExternal) {
    const resolvedItemPath = orgLinkResolver(item.url);
    if (
      currentPath === resolvedItemPath ||
      currentPath.startsWith(resolvedItemPath + "/")
    ) {
      return true;
    }
  }
  if (item.items) {
    return item.items.some((child) =>
      isSectionActive(currentPath, orgLinkResolver, child)
    );
  }
  return false;
}

/**
 * Removes the organization prefix from a given URL path.
 *
 * @param path - The URL path, potentially including an organization prefix.
 * @returns The path with the organization prefix removed, or "/" as a default.
 */
export function removeOrgPrefix(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 1) {
    return "/" + segments.slice(1).join("/");
  }
  return "/";
}

/**
 * Recursively searches through navigation items to find the hierarchical path
 * that matches the given `currentPathWithoutOrg`.
 * Used for constructing breadcrumbs.
 *
 * @param currentPathWithoutOrg - The current URL path, relative to the organization base.
 * @param items - The list of navigation items to search within.
 * @param currentHierarchy - The breadcrumb segments accumulated so far in the current recursion path.
 * @param orgLinkResolver - A function that resolves a relative path to an organization-specific path.
 * @returns An array of `BreadcrumbSegment` representing the full path if found, otherwise `null`.
 */
export function findPathRecursive(
  currentPathWithoutOrg: string,
  items: LayoutSidebarNavigationItem[],
  currentHierarchy: LayoutBreadcrumbSegment[],
  orgLinkResolver: (path: string) => string,
): LayoutBreadcrumbSegment[] | null {
  for (const item of items) {
    if (item.isExternal) {
      continue;
    }

    const newHierarchySegment: LayoutBreadcrumbSegment = {
      label: item.label,
      path: item.url ? orgLinkResolver(item.url) : undefined,
      navigatable: !!item.url,
    };

    if (item.url === currentPathWithoutOrg) {
      return [...currentHierarchy, newHierarchySegment];
    }

    if (
      item.url &&
      currentPathWithoutOrg.startsWith(item.url + "/") &&
      item.items &&
      item.items.length > 0
    ) {
      const foundInChildren = findPathRecursive(
        currentPathWithoutOrg,
        item.items,
        [...currentHierarchy, newHierarchySegment],
        orgLinkResolver,
      );
      if (foundInChildren) {
        return foundInChildren;
      }
    } else if (!item.url && item.items && item.items.length > 0) {
      const foundInChildren = findPathRecursive(
        currentPathWithoutOrg,
        item.items,
        [...currentHierarchy, newHierarchySegment],
        orgLinkResolver,
      );
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return null;
}

/**
 * Generates a unique key for a navigation group item, typically used for React lists
 * and managing collapsible states. The key is constructed by joining the labels
 * of the item and all its ancestors with a '/' separator.
 *
 * @param path - An array of strings representing the labels from the root to the current item.
 * @returns A unique string key for the group item.
 */
export function generateGroupPathKey(path: string[]): string {
  return path.join('/');
}