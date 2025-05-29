import { LucideIcon } from "lucide-react";

/**
 * Represents a single item within a navigation structure.
 * It can be a direct link, an external link, or a parent item for a list of sub-items.
 */
export interface LayoutSidebarNavigationItem {
  /** The display text for the navigation item. */
  label: string;
  /** The URL path this item links to. Optional if the item is a parent for sub-items without its own link. */
  url?: string;
  /** Optional icon component to be displayed next to the label. */
  icon?: LucideIcon;
  /** Optional content to render after the label. */
  renderAppendContent?: React.ReactNode;
  /** If true, the link will open in a new tab and is treated as an external URL. */
  isExternal?: boolean;
  /** Optional array of child `LayoutSidebarNavigationItem` objects for creating hierarchical navigation (sub-menus or groups). */
  items?: LayoutSidebarNavigationItem[];
  /**
   * Optional array of URL paths that, if matched by the current route, should also
   * cause this navigation item to be considered active. This is useful for items whose main `url`
   * might be a parent path, but activity should be shown for child routes as well.
   */
  activePaths?: string[];
}

/**
 * Defines the structure for the complete set of navigation data for the application layout,
 * typically separating main navigation links from those in the footer.
 */
export interface AppSidebarNavigationConfig {
  /** An array of `LayoutSidebarNavigationItem` objects for the primary navigation section (e.g., main sidebar). */
  navMain: LayoutSidebarNavigationItem[];
  /** An array of `LayoutSidebarNavigationItem` objects for the footer navigation section. */
  navFooter: LayoutSidebarNavigationItem[];
}

/**
 * Represents a single segment in a breadcrumb trail.
 */
export interface LayoutBreadcrumbSegment {
  /** The display label for the breadcrumb segment. */
  label: string;
  /** The URL path associated with this segment, if it's navigatable. */
  path?: string;
  /** Indicates whether this breadcrumb segment represents a navigatable link. */
  navigatable: boolean;
}