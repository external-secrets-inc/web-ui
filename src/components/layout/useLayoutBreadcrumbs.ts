import { type LayoutBreadcrumbSegment } from "@/components/layout";
import { useBreadcrumbs } from "@/components/layout/BreadcrumbsContext";
import { useMatches, type UIMatch, useLocation, type Location } from "react-router-dom";

/**
 * A handle on a route that can specify breadcrumb information.
 */
interface RouteHandle {
  breadcrumb?: (
    match: UIMatch,
    location: Location
  ) => LayoutBreadcrumbSegment;
}

/**
 * Custom React hook that generates a breadcrumb trail by inspecting the
 * currently matched routes. It builds the breadcrumbs declaratively from
 * `handle.breadcrumb` properties defined directly on the route objects.
 *
 * @returns An array of `LayoutBreadcrumbSegment` objects for the current page.
 */
export function useLayoutBreadcrumbs(): LayoutBreadcrumbSegment[] {
  const matches = useMatches();
  const location = useLocation();
  const { breadcrumbs } = useBreadcrumbs();

  const breadcrumbsResult = matches
    // First, filter out any matches that don't have a breadcrumb handle.
    .filter((match): match is UIMatch<unknown, RouteHandle> =>
      Boolean((match.handle as RouteHandle)?.breadcrumb)
    )
    // Then, map over the filtered matches to invoke the breadcrumb function
    .map((match) => {
      const breadcrumb = (match.handle as RouteHandle).breadcrumb!(
        match,
        location
      );
      // Check if there's a dynamic label for this path and override it
      const dynamicLabel = breadcrumbs[match.pathname];
      if (dynamicLabel) {
        return { ...breadcrumb, label: dynamicLabel };
      }
      return breadcrumb;
    });

  return breadcrumbsResult;
}