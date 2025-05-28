import type { LayoutSidebarNavigationItem } from "@/components/layout";
import {
  useLayoutNavigation,
  useLayoutSidebarGroupsState,
} from "@/components/layout";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroupLabel,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideChevronRight, LucideExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Type for the functions managing group open/closed states.
 */
interface SidebarGroupStateProps {
  isGroupOpen: (groupPathElements: string[]) => boolean;
  toggleGroup: (groupPathElements: string[], isOpen: boolean) => void;
}

/**
 * Base props for all navigation item components.
 */
interface BaseNavigationItemProps {
  /** The navigation item data. */
  item: LayoutSidebarNavigationItem;
  /** Function to resolve a relative path to an organization-specific path. */
  getOrgLink: (path: string) => string;
  /** The nesting level of the item, used for indentation. Defaults to 0. */
  level?: number;
  /** The path elements of the parent group, used for generating unique keys. */
  parentPathElements?: string[];
}

/**
 * Props for collapsible navigation item components (groups).
 */
interface CollapsibleNavigationItemProps
  extends BaseNavigationItemProps,
    SidebarGroupStateProps {}

/**
 * Renders a leaf navigation item (a direct link, not a collapsible group).
 * Handles both internal links (using React Router) and external links.
 */
const LeafNavItem: React.FC<BaseNavigationItemProps> = ({
  item,
  getOrgLink,
  level = 0,
}) => {
  const { isSectionActive } = useLayoutNavigation(getOrgLink);

  if (!item.url) return null;

  const IconComponent = item.icon;
  const isActive = isSectionActive(item);

  if (item.isExternal) {
    return (
      <SidebarMenuItem style={{ "--level": level } as React.CSSProperties}>
        <SidebarMenuButton asChild tooltip={item.label}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {IconComponent && <IconComponent />}
            <span className="font-medium">{item.label}</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuBadge>
          <LucideExternalLink />
        </SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuSubItem style={{ "--level": level - 1 } as React.CSSProperties}>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link to={getOrgLink(item.url)}>
          {IconComponent && <IconComponent className="text-violet-400" />}
          <span className="font-medium">{item.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
};

/**
 * Renders a collapsible group of navigation items for sub-levels (nested groups).
 * Manages the open/closed state of the collapsible group.
 */
const SubLevelGroupNavItem: React.FC<CollapsibleNavigationItemProps> = ({
  item,
  getOrgLink,
  level = 0,
  parentPathElements = [],
  isGroupOpen,
  toggleGroup,
}) => {
  if (!item.items?.length) return null;

  const currentPathElements = [...parentPathElements, item.label];
  const initiallyOpen = isGroupOpen(currentPathElements);

  return (
    <Collapsible
      asChild
      open={initiallyOpen}
      className="group"
      onOpenChange={(isOpen) => toggleGroup(currentPathElements, isOpen)}
    >
      <SidebarMenuItem style={{ "--level": level } as React.CSSProperties}>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton
            className={cn(
              "cursor-pointer select-none [&[data-state=open]>svg]:rotate-90 [&:hover>svg]:opacity-100 max-md:[&[data-state=closed]>svg]:opacity-100 gap-1",
              level > 1 &&
                "pl-[calc((var(--level)-1)*theme(spacing[2])+theme(spacing.2))]"
            )}
          >
            <SidebarGroupLabel className="p-0">{item.label}</SidebarGroupLabel>
            <LucideChevronRight className="transition-all duration-200 text-sidebar-foreground/70 opacity-0" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub
            className={cn(
              "px-0 pb-0 mx-0 border-0 gap-px translate-x-0 [&>li>a]:translate-x-0 [&:not(&_&)]:pb-2.5",
              level > 1 &&
                "[&>li>a]:pl-[calc((var(--level)-1)*theme(spacing[2])+theme(spacing.2))]"
            )}
          >
            {item.items.map((subItem: LayoutSidebarNavigationItem) => {
              if (subItem.items?.length) {
                return (
                  <SubLevelGroupNavItem
                    key={subItem.label}
                    item={subItem}
                    getOrgLink={getOrgLink}
                    level={level + 1}
                    parentPathElements={currentPathElements}
                    isGroupOpen={isGroupOpen}
                    toggleGroup={toggleGroup}
                  />
                );
              }
              return (
                <LeafNavItem
                  key={subItem.label}
                  item={subItem}
                  getOrgLink={getOrgLink}
                  level={level + 1}
                />
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

/**
 * Renders a top-level navigation item in the sidebar.
 * This can be either a direct link (if it has a URL and no sub-items) or a collapsible group (if it has sub-items).
 */
const TopLevelGroupNavItem: React.FC<CollapsibleNavigationItemProps> = ({
  item,
  getOrgLink,
  level = 0,
  parentPathElements = [],
  isGroupOpen,
  toggleGroup,
}) => {
  const { isSectionActive } = useLayoutNavigation(getOrgLink);

  const hasSubItems = Boolean(item.items?.length);
  const hasValidUrl = Boolean(item.url);

  if (!hasSubItems && !hasValidUrl) return null;

  const isActive = isSectionActive(item);

  if (hasValidUrl && !hasSubItems && item.url) {
    const IconComponent = item.icon;
    return (
      <SidebarMenuItem style={{ "--level": level } as React.CSSProperties}>
        <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
          <Link to={getOrgLink(item.url)}>
            {IconComponent && <IconComponent />}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (!item.items?.length) return null;

  const currentPathElements = [...parentPathElements, item.label];
  const initiallyOpen = isGroupOpen(currentPathElements);

  return (
    <Collapsible
      asChild
      open={initiallyOpen}
      onOpenChange={(isOpen) => toggleGroup(currentPathElements, isOpen)}
    >
      <SidebarMenuItem style={{ "--level": level } as React.CSSProperties}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.label}
            className="[&[data-state=open]>svg]:rotate-90 [&:hover>svg]:opacity-100 max-md:[&[data-state=closed]>svg]:opacity-100 gap-1"
          >
            <span>{item.label}</span>
            <LucideChevronRight className="transition-all duration-200 opacity-0" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub
            className={cn(
              "px-0 pb-2.5 mx-0 border-0 gap-px translate-x-0 [&>li>a]:translate-x-0",
              level > 1 &&
                "[&>li>a]:pl-[calc((var(--level)-1)*theme(spacing[2])+theme(spacing.2))]"
            )}
          >
            {item.items.map((subItem: LayoutSidebarNavigationItem) => {
              const isNestedGroup = Boolean(subItem.items?.length);
              if (isNestedGroup) {
                return (
                  <SubLevelGroupNavItem
                    key={subItem.label}
                    item={subItem}
                    getOrgLink={getOrgLink}
                    level={level + 1}
                    parentPathElements={currentPathElements}
                    isGroupOpen={isGroupOpen}
                    toggleGroup={toggleGroup}
                  />
                );
              }
              return (
                <LeafNavItem
                  key={subItem.label}
                  item={subItem}
                  getOrgLink={getOrgLink}
                  level={level + 1}
                />
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

/**
 * Props for the exported LayoutSidebarNavigationList component.
 */
interface LayoutSidebarNavigationListProps {
  /** An array of navigation items to be rendered in the sidebar. */
  items: LayoutSidebarNavigationItem[];
  /** Function to resolve a relative path to an organization-specific path. */
  getOrgLink: (path: string) => string;
}

/**
 * Renders the list of navigation items recursively for the layout sidebar.
 * It iterates over the provided items and delegates rendering to either
 * `LeafNavItem` for external links or `TopLevelGroupNavItem` for internal
 * links and collapsible groups.
 */
export const LayoutSidebarNavigationList: React.FC<
  LayoutSidebarNavigationListProps
> = ({ items, getOrgLink }) => {
  const { isGroupOpen, toggleGroup } = useLayoutSidebarGroupsState();

  return (
    <>
      {items.map((item) => {
        if (item.isExternal) {
          return (
            <LeafNavItem
              key={item.label}
              item={item}
              getOrgLink={getOrgLink}
              level={0}
            />
          );
        }
        return (
          <TopLevelGroupNavItem
            key={item.label}
            item={item}
            getOrgLink={getOrgLink}
            level={0}
            parentPathElements={[]}
            isGroupOpen={isGroupOpen}
            toggleGroup={toggleGroup}
          />
        );
      })}
    </>
  );
};
