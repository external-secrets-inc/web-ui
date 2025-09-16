// components/status/StatusBadge.tsx
import { Status, StatusMap } from "./Common.interfaces";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface StatusBadgeProps {
  statusData?: Status;
  map: StatusMap;
  unknownMessage: string; // message when statusData is missing
  defaultDisplay?: string; // fallback display when unmapped
  defaultMessage?: string; // fallback message when unmapped
  className?: string; // optional extra classes for the <Badge>
  formatFunction?: (msg?: string) => string | undefined; // optional custom message formatter
}

function resolveText(
  statusData: Status | undefined,
  map: StatusMap,
  unknownMessage: string,
  defaultDisplay = "Not Informed",
  defaultMessage = "Unmapped status retrieved",
  formatFunction?: (msg?: string) => string | undefined
) {
  if (!statusData) {
    return {
      variant: "secondary" as BadgeProps["variant"],
      displayText: "Unknown",
      messageText: unknownMessage,
    };
  }

  const { status, reason, message } = statusData;
  const rule = status ? map[status] : undefined;

  if (rule) {
    const display =
      typeof rule.display === "function"
        ? rule.display(statusData)
        : rule.display ?? reason ?? defaultDisplay;

    const baseMsg =
      typeof rule.message === "function"
        ? rule.message(statusData)
        : rule.message ?? message ?? defaultMessage;

    const rawMessage = baseMsg ?? defaultMessage;
    const messageText = formatFunction
      ? formatFunction(rawMessage)
      : rawMessage;

    return {
      variant: rule.variant,
      displayText: display,
      messageText,
    };
  }

  return {
    variant: "default" as BadgeProps["variant"],
    displayText: status ?? defaultDisplay,
    messageText: reason ?? defaultMessage,
  };
}

export function StatusBadge({
  statusData,
  map,
  unknownMessage,
  defaultDisplay = "Not Informed",
  defaultMessage = "Unmapped status retrieved",
  className,
  formatFunction,
}: StatusBadgeProps) {
  const { variant, displayText, messageText } = resolveText(
    statusData,
    map,
    unknownMessage,
    defaultDisplay,
    defaultMessage,
    formatFunction
  );

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Badge
          className={`
            py-1 px-2 cursor-default transition-[opacity,transform] ease-in-out opacity-100
            shadow-sm
            animate-in fade-in-0 zoom-in-150 duration-500
            hover:scale-105 active:scale-100 [transition-duration:200ms]
            ${className ?? ""}
          `}
          variant={variant}
        >
          <span className="transition-transform">{displayText}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <span className="whitespace-pre-line">{messageText}</span>
      </TooltipContent>
    </Tooltip>
  );
}
