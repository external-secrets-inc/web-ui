import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Status, StatusMap } from "./Common.interfaces";

export interface StatusBadgeProps {
  /**
   * Status data object containing status, reason, and optional message.
   */
  statusData?: Status;

  /**
   * Mapping of status strings to their display configuration (variant, display text, message).
   */
  map: StatusMap;

  /**
   * Message to display when statusData is missing or undefined.
   */
  unknownMessage: string;

  /**
   * Fallback display text when status is unmapped.
   * @default "Not Informed"
   */
  defaultDisplay?: string;

  /**
   * Fallback message text when status is unmapped.
   * @default "Unmapped status retrieved"
   */
  defaultMessage?: string;

  /**
   * Additional CSS classes to apply to the Badge component.
   */
  className?: string;

  /**
   * Optional function to transform or format the message before display.
   * Can return a string or React node for custom rendering.
   */
  formatFunction?: (msg?: string) => React.ReactNode;
}

function resolveText(
  statusData: Status | undefined,
  map: StatusMap,
  unknownMessage: string,
  defaultDisplay = "Not Informed",
  defaultMessage = "Unmapped status retrieved",
  formatFunction?: (msg?: string) => React.ReactNode
) {
  if (!statusData) {
    return {
      variant: "secondary" as BadgeProps["variant"],
      displayText: "Unknown",
      messageText: unknownMessage as React.ReactNode,
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
      ? formatFunction(rawMessage) ?? rawMessage
      : rawMessage;

    return {
      variant: rule.variant,
      displayText: display,
      messageText: messageText as React.ReactNode,
    };
  }

  return {
    variant: "default" as BadgeProps["variant"],
    displayText: status ?? defaultDisplay,
    messageText: (reason ?? defaultMessage) as React.ReactNode,
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
          className={cn(
            "py-1 px-2 cursor-default shadow-sm",
            "opacity-100 transition-[opacity,transform] ease-in-out",
            "animate-in fade-in-0 zoom-in-150 duration-500",
            "hover:scale-105 [transition-duration:200ms]",
            className
          )}
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
