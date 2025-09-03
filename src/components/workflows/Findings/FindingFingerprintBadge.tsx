import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  computeFindingFingerprint,
  computeFingerprintCssVars,
} from "@/components/workflows/Findings/Findings.utils";
import { cn } from "@/lib/utils";
import { LucideFingerprint } from "lucide-react";

interface FindingFingerprintBadgeProps {
  /** The seed value to generate a stable fingerprint from */
  seed: string | undefined;
  className?: string;
}

/**
 * A reusable badge component that displays a stable 3-character fingerprint
 * with consistent colors based on the provided seed value.
 */
export function FindingFingerprintBadge({
  seed,
  className = "",
}: FindingFingerprintBadgeProps) {
  const fingerprint = computeFindingFingerprint({ id: seed });
  const cssVars = computeFingerprintCssVars(seed);

  if (!fingerprint) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center pl-1 font-mono text-xs gap-1.5 bg-[var(--color-bg)] border-[var(--color-border)]",
            className
          )}
          style={cssVars}
        >
          <LucideFingerprint className="text-muted-foreground" />
          {fingerprint}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        <LucideFingerprint className="size-5 text-muted-foreground" />
        Fingerprint to help you identify this unique finding
      </TooltipContent>
    </Tooltip>
  );
}
