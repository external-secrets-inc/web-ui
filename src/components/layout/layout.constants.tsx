import { AuditListenerStatusBadge } from "@/components/Audit/AuditListenerStatusBadge";
import { AppSidebarNavigationConfig } from "@/components/layout";
import { FindingsCountBadge } from "@/components/workflows/Findings/FindingsCountBadge";
import { DOCS_DOMAIN } from "@/constants";
import {
  LucideArrowDownToDot,
  LucideAsteriskSquare,
  LucideAtom,
  LucideBarChart3,
  LucideBookKey,
  LucideBookOpen,
  LucideBot,
  LucideComputer,
  LucideCrosshair,
  LucideFolderKey,
  LucideIdCard,
  LucideLockKeyhole,
  LucideRotateCcwKey,
  LucideSettings,
  LucideShieldCheck,
  LucideSquareStack,
  LucideUserCog,
  LucideWorkflow,
} from "lucide-react";

export const appSidebarNavigationConfig: AppSidebarNavigationConfig = {
  navMain: [
    {
      label: "Resources",
      items: [
        {
          label: "Secrets",
          url: "/resources/secrets",
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
          icon: LucideCrosshair,
        },
      ],
    },
    {
      label: "Federation",
      items: [
        {
          label: "Identity Providers",
          url: "/federation/identity-providers",
          icon: LucideIdCard,
        },
        {
          label: "Authorizations",
          url: "/federation/authorizations",
          icon: LucideLockKeyhole,
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
          url: "/findings/reused-secrets",
          icon: LucideSquareStack,
          renderAppendContent: <FindingsCountBadge />,
        },
        {
          label: "Consumers",
          url: "/findings/consumers",
          icon: LucideComputer,
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
