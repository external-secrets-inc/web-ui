import { LucideAlertCircle, LucideCheckCircle, LucideTrash2, LucideXCircle } from "lucide-react";

export const STATUS_MAP: { [key: string]: { text: string, icon: React.ReactNode } } = {
  "PROVISIONING": {
    text: "Provisioning",
    icon: <LucideAlertCircle className="text-orange-500" />
  },
  "PENDING_REGISTRATION": {
    text: "Pending Registration",
    icon: <LucideAlertCircle className="text-orange-500" />
  },
  "ACTIVE": {
    text: "Active",
    icon: <LucideCheckCircle className="text-green-700" />
  },
  "OFFLINE": {
    text: "Offline",
    icon: <LucideXCircle className="text-muted-foreground" />
  },
  "PENDING_DELETION": {
    text: "Pending Deletion",
    icon: <LucideTrash2 className="text-destructive" />
  },
  "DELETED": {
    text: "Deleted",
    icon: <LucideAlertCircle className="text-destructive" />
  }
};