import { LucideAlertCircle, LucideCheckCircle, LucideTrash2, LucideXCircle } from "lucide-react";

export const STATUS_MAP: { [key: string]: { text: string, icon: React.ReactNode } } = {
  "PROVISIONING": {
    text: "Provisioning",
    icon: <LucideAlertCircle className="text-warning" />
  },
  "PENDING_REGISTRATION": {
    text: "Pending Registration",
    icon: <LucideAlertCircle className="text-warning" />
  },
  "ACTIVE": {
    text: "Active",
    icon: <LucideCheckCircle className="text-success" />
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