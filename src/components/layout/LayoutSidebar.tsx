import AppLogo from "@/components/AppLogo";
import {
  LayoutSidebarNavigationList,
  LayoutSidebarUserMenu,
  useLayoutNavigation,
  useLayoutSidebarMobileClose,
} from "@/components/layout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import useOrgLink from "@/hooks/useOrgLink";
import { cn } from "@/lib/utils";

export function LayoutSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const getOrgLink = useOrgLink();
  const { navMain, navFooter } = useLayoutNavigation(getOrgLink);

  useLayoutSidebarMobileClose();

  return (
    <Sidebar
      className="z-50"
      collapsible="offcanvas"
      variant="inset"
      {...props}
    >
      <SidebarHeader className="h-11">
        <div className="px-0.5">
          <AppLogo />
        </div>
      </SidebarHeader>
      <SidebarContent
        className={cn(
          "[&_:is([data-sidebar=menu-button],[data-sidebar=menu-sub-button]):hover:has(a:hover,button:hover)]:bg-transparent",
          "[&_:is([data-sidebar=menu-button],[data-sidebar=menu-sub-button])]:!pr-2",
          "[&_[data-sidebar=menu-action]]:relative",
          "[&_[data-sidebar=menu-action]]:top-[unset]",
          "[&_[data-sidebar=menu-action]]:right-[unset]",
          "[&_[data-sidebar=menu-action]]:rounded-xs"
        )}
      >
        <SidebarGroup>
          <SidebarMenu>
            <LayoutSidebarNavigationList
              items={navMain}
              getOrgLink={getOrgLink}
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <LayoutSidebarNavigationList
              items={navFooter}
              getOrgLink={getOrgLink}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LayoutSidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
