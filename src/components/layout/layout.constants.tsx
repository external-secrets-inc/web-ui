import {
  LucideArrowDownToDot,
  LucideAsteriskSquare,
  LucideAtom,
  LucideBarChart3,
  LucideBookKey,
  LucideBookOpen,
  LucideBot,
  LucideFolderKey,
  LucideKey,
  LucideLocateFixed,
  LucideNewspaper,
  LucideRotateCcwKey,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideUserCog,
} from "lucide-react";
import { DOCS_DOMAIN } from "@/constants";
import { AppSidebarNavigationConfig } from "@/components/layout";
import { AuditListenerStatusBadge } from "@/components/Audit/AuditListenerStatusBadge";

export const appSidebarNavigationConfig: AppSidebarNavigationConfig = {
  navMain: [
    {
      label: "Resources",
      icon: LucideKey,
      items: [
        {
          label: "External Secrets",
          url: "/workflows/secrets",
          icon: LucideAsteriskSquare,
        },
        {
          label: "Service Accounts",
          url: "/workflows/service-accounts",
          icon: LucideUserCog,
        },
        {
          label: "Secret Stores",
          url: "/workflows/secret-stores",
          icon: LucideBookKey,
        },
        {
          label: "Generators",
          url: "/workflows/generators",
          icon: LucideAtom,
        },
        {
          label: "Targets",
          url: "/workflows/targets",
          icon: LucideLocateFixed,
        },
      ],
    },
    {
      label: "Workflows",
      icon: LucideNewspaper,
      items: [
        {
          label: "Runbooks",
          url: "/workflows/templates",
          icon: LucideNewspaper,
        },
      ],
    },
    {
      label: "Findings",
      icon: LucideSearch,
      items: [
        {
          label: "Reused Secrets",
          url: "/findings",
          icon: LucideSearch,
        },
      ],
    },
    {
      label: "Audit",
      icon: LucideBarChart3,
      items: [
        {
          label: "Insights",
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
          icon: LucideArrowDownToDot,
        },
      ],
    },
    {
      label: "Operations",
      icon: LucideBot,
      items: [
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
