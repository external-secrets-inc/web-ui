import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FindingFingerprintBadge } from "@/components/workflows/Findings/FindingFingerprintBadge";
import {
  LucideAsteriskSquare,
  LucideAtSign,
} from "lucide-react";
import type { FindingRendererItem } from "./Finding.interfaces";

type Props = {
  /** The finding metadata */
  meta?: FindingRendererItem;
  /** Fallback label if no displayName in metadata */
  fallbackLabel: string;
  /** Optional icon node to display */
  iconNode?: React.ReactNode;
  /** Optional checkbox node for multi-select */
  checkboxNode?: React.ReactNode;
  /** Variant for different use cases */
  variant?: "option" | "badge";
};

/**
 * Reusable component for rendering finding option rows.
 * Handles display name, property, fingerprint badge, and counts badge.
 */
export function FindingOptionRow({
  meta,
  fallbackLabel,
  iconNode,
  checkboxNode,
  variant = "option"
}: Props) {
  const displayName = meta?.displayName ?? fallbackLabel;
  const property = meta?.property?.trim();
  const hasProperty = Boolean(property);
  const locationsCount = meta?.locationsCount;
  const storesCount = meta?.storesCount;
  const hasCounts = typeof locationsCount === "number" || typeof storesCount === "number";

  const countsBadge = hasCounts && (
    <CountsBadge
      locationsCount={locationsCount}
      storesCount={storesCount}
      variant={variant}
    />
  );

  if (variant === "badge") {
    return (
      <>
        {iconNode}
        <span className="font-semibold leading-none">
          {displayName}
          {hasProperty && (
            <span className="leading-none font-bold text-muted-foreground">.{property}</span>
          )}
        </span>
        {meta?.id && (
          <FindingFingerprintBadge className="pointer-events-auto" seed={meta.id} />
        )}
        {countsBadge}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {checkboxNode}
      <div className="flex-1 min-w-0 inline-flex items-center gap-2">
        {iconNode}
        <span className="text-sm font-semibold leading-none text-foreground truncate">
          {displayName}
          {hasProperty && (
            <span className="leading-none font-bold text-muted-foreground">
              .{property}
            </span>
          )}
        </span>
        {meta?.id && (
          <FindingFingerprintBadge
            className="pointer-events-auto"
            seed={meta.id}
          />
        )}
      </div>
      {countsBadge}
    </div>
  );
}

function CountsBadge({
  locationsCount,
  storesCount,
  variant = "option"
}: {
  locationsCount?: number;
  storesCount?: number;
  variant?: "option" | "badge";
}) {
  const hasLocations = typeof locationsCount === "number";
  const hasStores = typeof storesCount === "number";
  if (!hasLocations && !hasStores) return null;

  const n = locationsCount ?? 0;
  const m = storesCount ?? 0;
  const duplicateWord = n > 0 ? "duplicates" : "duplicate";
  const storeWord = m > 0 ? "stores" : "store";
  const preposition = m > 0 ? "across" : "on";

  if (variant === "badge") {
    return (
      <div className="flex items-center -mr-0.5">
        <Badge
          variant="outline"
          className="leading-none pl-1.5 -my-px font-medium flex items-center gap-1 border-transparent"
        >
          <LucideAsteriskSquare className="size-2.5 text-muted-foreground -ml-0.5" />
          {n}
          <LucideAtSign className="size-2.5 text-muted-foreground ml-1" />
          {m}
        </Badge>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className="flex items-center gap-2 pl-1.5 pointer-events-auto font-mono"
        >
          {hasLocations && (
            <span className="inline-flex items-center gap-1 text-primary-muted font-bold">
              <LucideAsteriskSquare className="size-3 text-muted-foreground" />
              {n}
            </span>
          )}
          {hasStores && (
            <span className="inline-flex items-center gap-1 text-primary-muted font-bold">
              <LucideAtSign className="size-3 text-muted-foreground" />
              {m}
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-muted-foreground">
          <span className="text-primary-muted font-bold  font-mono">{n}</span>{" "}
          {duplicateWord} found {preposition}{" "}
          <span className="text-primary-muted font-bold  font-mono">{m}</span>{" "}
          {storeWord}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
