import {
  LucideBarChart3,
  LucideBookKey,
  LucideBookOpen,
  LucideBot,
  LucideLocateFixed,
  LucideRotateCcwKey,
  LucideSettings,
  LucideShieldCheck,
} from "lucide-react";
import { DOCS_DOMAIN } from "@/constants";
import { LayoutSidebarNavigationData } from "@/components/layout";

export const navigationData: LayoutSidebarNavigationData = {
  navMain: [
    {
      label: "Audit",
      items: [
        {
          label: "Monitoring",
          items: [
            {
              label: "Dashboard",
              url: "/audit/dashboard",
              icon: LucideBarChart3,
            },
          ],
        },
        {
          label: "Credential Stores",
          items: [
            {
              label: "Providers",
              url: "/audit/providers",
              icon: LucideBookKey,
            },
          ],
        },
        {
          label: "Policy Control",
          items: [
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
          ],
        },
      ],
    },
    {
      label: "Credentials Ops",
      items: [
        {
          label: "Agents",
          url: "/agents",
          icon: LucideBot,
        },
        {
          label: "Reloaders",
          url: "/rotators",
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