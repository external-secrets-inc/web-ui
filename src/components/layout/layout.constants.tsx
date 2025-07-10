import {
  LucideAtom,
  LucideBarChart3,
  LucideBookKey,
  LucideBookOpen,
  LucideBot,
  LucideFolderKey,
  LucideLocateFixed,
  LucideRotateCcwKey,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
} from "lucide-react";
import { DOCS_DOMAIN } from "@/constants";
import { AppSidebarNavigationConfig } from "@/components/layout";
import { AuditListenerStatusBadge } from "@/components/Audit/AuditListenerStatusBadge";

export const appSidebarNavigationConfig: AppSidebarNavigationConfig = {
  navMain: [
    {
      label: "Audit Insights",
      url: "/audit/insights",
      renderAppendContent: <AuditListenerStatusBadge compact />,
      icon: LucideBarChart3,
    },
    {
      label: "Providers",
      url: "/audit/providers",
      icon: LucideFolderKey,
    },
    {
      label: "Policies",
      url: "/audit/policies",
      icon: LucideShieldCheck,
    },
    {
      label: "Destinations",
      url: "/audit/destinations",
      icon: LucideLocateFixed,
    },
    {
      label: "Workflow Secret Stores",
      url: "/workflows/secret-stores",
      icon: LucideBookKey,
    },
    {
      label: "Workflow Generators",
      url: "/workflows/generators",
      icon: LucideAtom,
    },
    {
      label: "Workflow Templates",
      url: "/workflows/templates",
      icon: LucideBookKey,
    },
    {
      label: "Findings",
      url: "/findings",
      icon: LucideSearch,
    },
    {
      label: "Agents",
      url: "/agents",
      icon: LucideBot,
    },
    {
      label: "Reloaders",
      url: "/reloaders",
      icon: LucideRotateCcwKey,
    },
  ],
  navFooter: [
    {
      label: "Docs",
      url: DOCS_DOMAIN,
      icon: LucideBookOpen,
      isExternal: true,
    },
    {
      label: "Settings",
      url: "/settings",
      icon: LucideSettings,
    },
  ],
};
