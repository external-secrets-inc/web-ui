import { Status } from "../Common.interfaces";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConsumerStatusBadgeProps {
  statusData?: Status
}
export function ConsumerStatusBadge({
  statusData
}: ConsumerStatusBadgeProps) {
  let variantClass: BadgeProps["variant"] = "default";
  let displayText = "Not Informed";
  let messageText = "Unmapped status retrieved"

  if (!statusData) {
    variantClass = "secondary"
    displayText = "Unknown";
    messageText = "No status was retrieved from this secret store"
  } else {
    const { status, reason, message } = statusData;
    const formatted = message?.replace(/:/g, ':\n');
    if (status === "PendingUpdate") {
      variantClass = "warning";
      displayText = reason || "Pending Update";
      messageText = message || "Locations out to date";
    } else if (status === "UsingLatestVersion") {
      variantClass = "success";
      displayText = reason || "Ready";
      messageText = formatted || "Locations up to date";
    } else {
      displayText = status || displayText;
      messageText = reason || messageText;
    }
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
          <Badge
            className="
              py-1 px-2 cursor-default transition-[opacity,transform] ease-in-out opacity-100
              shadow-sm
              animate-in fade-in-0 zoom-in-150 duration-500
              hover:scale-105 active:scale-100 [transition-duration:200ms]
            "
            variant={variantClass}
          >
            <span className="transition-transform">{displayText}</span>
          </Badge>
      </TooltipTrigger>
      <TooltipContent className="p-4">
        <span className="whitespace-pre-line">{messageText}</span>
      </TooltipContent>
    </Tooltip >
  );
}
