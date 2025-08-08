import {
  LucideArrowDownToDot,
  LucideAsteriskSquare,
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
  LucideUserCog,
  LucideWorkflow,
} from "lucide-react";
import { DOCS_DOMAIN } from "@/constants";
import { AppSidebarNavigationConfig } from "@/components/layout";
import { AuditListenerStatusBadge } from "@/components/Audit/AuditListenerStatusBadge";

export const appSidebarNavigationConfig: AppSidebarNavigationConfig = {
  navMain: [
    {
      label: "Resources",
      items: [
        {
          label: "External Secrets",
          url: "/resources/external-secrets",
          icon: LucideAsteriskSquare,
        },
        {
          label: "Service Accounts",
          url: "/resources/service-accounts",
          icon: LucideUserCog,
        },
        {
          label: "Secret Stores",
          url: "/resources/secret-stores",
          icon: LucideBookKey,
        },
        {
          label: "Generators",
          url: "/resources/generators",
          icon: LucideAtom,
        },
        {
          label: "Targets",
          url: "/resources/targets",
          icon: LucideLocateFixed,
        },
      ],
    },
    {
      label: "Automation",
      items: [
        {
          label: "Workflows",
          url: "/automation/workflows",
          icon: LucideWorkflow,
        },
      ],
    },
    {
      label: "Findings",
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
      items: [
        {
          label: "Agents",
          url: "/operations/agents",
          icon: LucideBot,
        },
        {
          label: "Reloaders",
          url: "/operations/reloaders",
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
