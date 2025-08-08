import {
  LucideAtom,
  LucideBarChart3,
  LucideBookKey,
  LucideBookOpen,
  LucideBot,
  LucideComputer,
  LucideFolderKey,
  LucideKey,
  LucideLocateFixed,
  LucideNewspaper,
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
      label: "Workflow Secrets",
      url: "/workflows/secrets",
      icon: LucideKey,
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
      label: "Workflow Targets",
      url: "/workflows/targets",
      icon: LucideComputer,
    },
    {
      label: "Workflow Templates",
      url: "/workflows/templates",
      icon: LucideNewspaper,
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
