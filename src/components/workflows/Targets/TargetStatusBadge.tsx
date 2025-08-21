import { Status } from "../Common.interfaces";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TargetStatusBadgeProps {
  statusData?: Status
}
export function TargetStatusBadge({
  statusData
}: TargetStatusBadgeProps) {
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
    if (status === "Pending") {
      variantClass = "warning";
      displayText = "Pending";
      messageText = reason || messageText;
    } else if (status === "True") {
      variantClass = "success";
      displayText = reason || "Ready";
      messageText = formatted || "Valid secret store";
    } else if (status === "False") {
      variantClass = "destructive";
      displayText = reason || "Error";
      messageText = formatted || "Undefined error";
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
