import { LayoutBannerSubscription, LayoutBreadcrumbs, LayoutSidebar } from "@/components/layout";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { Outlet } from "react-router-dom";

export function LayoutRoot() {
  const persistedSidebarOpen = Cookies.get("sidebar_state") === "true";

  return (
    <SidebarProvider
      defaultOpen={persistedSidebarOpen}
      className="h-svh overflow-hidden"
    >
      <LayoutSidebar />
      <SidebarInset className="min-h-0 overflow-clip">
        <ScrollArea className="h-full flex-1 min-h-0 [&_[data-radix-scroll-area-content]]:min-w-0">
          <div className="bg-background/80 flex-none border-b border-sidebar px-4 h-11 sticky top-0 z-20 backdrop-blur-lg flex items-center gap-2">
            <SidebarTrigger className="flex-none -ml-1.5" />
            <Separator orientation="vertical" className="mr-1.5 h-4" />
            <LayoutBreadcrumbs className="flex-1" />
          </div>
          <LayoutBannerSubscription />

          {/* Where the routes are rendered */}
          <Outlet />

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
