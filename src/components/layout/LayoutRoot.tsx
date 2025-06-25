import {
  LayoutBannerSubscription,
  LayoutBreadcrumbs,
  LayoutSidebar,
} from "@/components/layout";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutTopbarActionsPortalProvider } from "@/components/layout/LayoutPortalTopbarActions";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

export function LayoutRoot() {
  const persistedSidebarOpen = Cookies.get("sidebar_state") !== "false";
  const topbarActionsPortalTargetRef = useRef<HTMLDivElement>(null);
  const [
    topbarActionsPortalTargetElement,
    setTopbarActionsPortalTargetElement,
  ] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (topbarActionsPortalTargetRef.current) {
      setTopbarActionsPortalTargetElement(topbarActionsPortalTargetRef.current);
    }
  }, []);

  return (
    <SidebarProvider
      defaultOpen={persistedSidebarOpen}
      className="h-svh overflow-hidden bg-sidebar-gradient [&_[data-sidebar=sidebar]]:[background:inherit]"
    >
      <LayoutSidebar />

      {/* PSA: this is the <main> element */}
      <SidebarInset
        className={cn(
          "min-h-0 min-w-0 overflow-clip",
          "[container-type:inline-size]",
          /**
           * Layout Containment Strategy:
           *
           * A layout system that enables wide content (e.g., data tables) to coexist with
           * contained elements in a responsive manner. Using container queries and custom
           * properties, elements marked with `data-layout-contain-on-x-scroll` automatically
           * adapt to the main container's width while maintaining proper positioning during
           * horizontal scroll.
           *
           * This approach, inspired by Notion, solves two challenges:
           * 1. Mixing wide and contained content without breaking layout
           * 2. Supporting multiple sticky elements that respect horizontal constraints
           *
           * The pattern enhances responsiveness by allowing elements to independently
           * decide their containment behavior, adapting to both the viewport and their
           * container's width.
           *
           * Note: When this is the desired behavior, it requires careful planning of layout
           * hierarchy, as improper containment choices can lead to unintended scrolling
           * behavior.
           */
          "[&_[data-layout-contain-on-x-scroll]]:sticky",
          "[&_[data-layout-contain-on-x-scroll]]:left-[--layout-padding]",
          "[&_[data-layout-contain-on-x-scroll]]:[max-width:calc(100cqw-var(--layout-padding)*2)]"
        )}
      >
        <ScrollArea
          id="layout-root-scroll-area"
          className="h-full flex-1 min-h-0"
        >
          <span className="h-[--layout-topbar-height] absolute top-0 left-0 right-0 z-10 backdrop-blur-xl" />
          <div className="bg-background/80 flex-none border-b border-sidebar sticky top-0 z-20 flex">
            <div
              className="h-[--layout-topbar-height] flex items-center gap-1.5 md:gap-4 w-full"
              data-layout-contain-on-x-scroll
            >
              <SidebarTrigger className="flex-none -ml-1.5" />
              <Separator orientation="vertical" className="mr-1.5 h-4" />
              <LayoutBreadcrumbs className="flex-1" />
              <div
                ref={topbarActionsPortalTargetRef}
                className="ml-auto flex items-center gap-2"
              />
            </div>
          </div>
          <LayoutBannerSubscription />

          <LayoutTopbarActionsPortalProvider
            value={topbarActionsPortalTargetElement}
            >
            {/* Where the routes are rendered */}
            <Outlet />
          </LayoutTopbarActionsPortalProvider>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
