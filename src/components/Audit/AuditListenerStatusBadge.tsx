import { Badge } from "@/components/ui/badge";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/context/SubscriptionContext";
import useOrgLink from "@/hooks/useOrgLink";
import { cn } from "@/lib/utils";
import useAuditSetup from "@/services/audit/hooks/useAuditSetup";
import { Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { LISTENER_STATUS } from "./Audit.constants";

const STATUS_CONFIG = {
  [LISTENER_STATUS.ACTIVE]: {
    label: "Listener active",
    variant: "success",
    color: "text-green-500",
  },
  [LISTENER_STATUS.OFFLINE]: {
    label: "Listener offline",
    variant: "destructive",
    color: "text-red-500",
  },
  [LISTENER_STATUS.PENDING_INSTALLATION]: {
    label: "Listener not installed",
    variant: "warning",
    color: "text-orange-500",
  },
} as const;

type StatusConfig = (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];

/**
 * Maps a listener status string to its corresponding visual configuration.
 *
 * @param status - The current status of the listener
 * @returns Configuration object containing label, variant, and color for the status
 */
const getStatusConfig = (status: string): StatusConfig =>
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: "Unknown Listener",
    variant: "secondary",
    color: "text-gray-500",
  };

interface AuditListenerStatusBadgeProps {
  /**
   * If true, only the blinking circle with a tooltip will be shown.
   */
  compact?: boolean;
}

/**
 * Displays the current operational status of the audit listener in the UI.
 * The status is represented by a badge with a colored indicator and descriptive label.
 *
 * @returns A React element containing the status badge, or null if the status cannot be determined
 */
export function AuditListenerStatusBadge({
  compact = false,
}: AuditListenerStatusBadgeProps) {
  const {
    hasFeature,
    isLoading: isLoadingSubscriptions,
    error: subscriptionError,
  } = useSubscription();

  const {
    auditListener,
    isLoading: isLoadingSetup,
    error: setupError,
  } = useAuditSetup();

  const getOrgUrl = useOrgLink();

  const hasAuditFeatureAccess = hasFeature("Listener Component");
  const isDataLoading = isLoadingSubscriptions || isLoadingSetup;
  const hasErrors = Boolean(subscriptionError || setupError);
  const hasListenerData = Boolean(auditListener);

  const shouldNotRender =
    isDataLoading || !hasAuditFeatureAccess || hasErrors || !hasListenerData;

  if (shouldNotRender) {
    return null;
  }

  const config = getStatusConfig(auditListener?.status ?? "unknown");

  if (compact) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            {auditListener?.status !== LISTENER_STATUS.ACTIVE ? (
              <SidebarMenuAction asChild>
                <Link to={getOrgUrl("/audit/dashboard")}>
                  <Circle
                    className={cn("w-2 box-content", config.color)}
                    fill="currentColor"
                  />
                </Link>
              </SidebarMenuAction>
            ) : (
              <Circle
                className={cn("w-2 h-2 p-3 -mr-3 box-content", config.color)}
                fill="currentColor"
              />
            )}
          </TooltipTrigger>
          <TooltipContent>
            Audit {config.label}.
            {auditListener?.status !== LISTENER_STATUS.ACTIVE && (
              <>
                <br /> View Dashboard.
              </>
            )}
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Circle
          className={cn("w-2 h-2 animate-pulse", config.color)}
          fill="currentColor"
        />
        {config.label}
      </Badge>
    </div>
  );
}
