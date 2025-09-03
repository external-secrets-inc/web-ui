import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { Badge } from "@/components/ui/badge";
import { useFieldSelectData } from "@/components/ui/fields/fields.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FindingFingerprintBadge } from "@/components/workflows/Findings/FindingFingerprintBadge";
import {
  LucideAsteriskSquare,
  LucideAtSign,
  LucideLocateFixed,
} from "lucide-react";
import type { Renderer } from "../renderers.interfaces";

/**
 * Metadata for finding renderer items used in select fields.
 * Contains display information and counts for findings.
 */
export interface FindingRendererItem {
  /** Display name for the finding */
  displayName?: string;
  /** Property name associated with the finding */
  property?: string;
  /** Unique identifier for the finding */
  id?: string;
  /** Number of locations where this finding appears */
  locationsCount?: number;
  /** Number of stores where this finding appears */
  storesCount?: number;
}

function CountsBadge({
  locationsCount,
  storesCount,
}: {
  locationsCount?: number;
  storesCount?: number;
}) {
  const hasLocations = typeof locationsCount === "number";
  const hasStores = typeof storesCount === "number";
  if (!hasLocations && !hasStores) return null;

  const n = locationsCount ?? 0;
  const m = storesCount ?? 0;
  const duplicateWord = n > 0 ? "duplicates" : "duplicate";
  const storeWord = m > 0 ? "stores" : "store";
  const preposition = m > 0 ? "across" : "on";

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

function FindingRowMain({
  iconNode,
  displayName,
  property,
  fingerprintSeed,
}: {
  iconNode: React.ReactNode;
  displayName: string;
  property?: string;
  fingerprintSeed?: string;
}) {
  return (
    <div className="flex-1 min-w-0 inline-flex items-center gap-2">
      {iconNode}
      <span className="text-sm font-semibold leading-none text-foreground truncate">
        {displayName}
        {property && (
          <span className="leading-none font-bold text-muted-foreground">
            .{property}
          </span>
        )}
      </span>
      {fingerprintSeed && (
        <FindingFingerprintBadge
          className="pointer-events-auto"
          seed={fingerprintSeed}
        />
      )}
    </div>
  );
}

const SelectFindingRenderer: Renderer = ({
  field,
  controller,
  utils,
  data,
  id,
  style,
  ...ariaAttributes
}) => {
  const { commonProps } = useFieldSelectData(
    field,
    controller,
    data?.apiOptions as SelectFieldOptions
  );

  const isFinding = field.uiMetadata?.renderer?.name === "finding";
  if (!isFinding) return null;

  const renderer = field.uiMetadata?.renderer as
    | { name: "finding"; metadata?: Record<string, FindingRendererItem> }
    | undefined;
  const metadataMap: Record<string, FindingRendererItem> =
    renderer?.metadata ?? {};

  // option.value is a dotted path like "<field.id>.<findingId>" (to submit a rich manifest value).
  // UI needs the plain findingId to read `uiMetadata.renderer.metadata[findingId]`.
  // Strategy: remove the exact "<field.id>." prefix; if absent, use the last dotted segment.
  function getFindingId(rawValue: string): string {
    const decoded = utils.deserializeFieldValueFromString(rawValue);
    const value = typeof decoded === "string" ? decoded : rawValue;
    const prefix = `${field.id}.`;
    if (value.startsWith(prefix)) return value.slice(prefix.length);
    const lastDot = value.lastIndexOf(".");
    return lastDot < 0 ? value : value.slice(lastDot + 1);
  }

  function resolveFinding(
    optionValue: string
  ): FindingRendererItem | undefined {
    const id = getFindingId(optionValue);
    return metadataMap[id];
  }

  function renderRow(option: Option, iconNode: React.ReactNode) {
    const meta = resolveFinding(option.value);
    const displayName = meta?.displayName ?? option.label;
    const property = meta?.property?.trim();

    return (
      <div className="flex items-center gap-2 w-full">
        <FindingRowMain
          iconNode={iconNode}
          displayName={displayName}
          property={property}
          fingerprintSeed={meta?.id}
        />
        <CountsBadge
          locationsCount={meta?.locationsCount}
          storesCount={meta?.storesCount}
        />
      </div>
    );
  }

  return (
    <EsiSelect
      {...commonProps}
      id={id}
      style={style}
      {...ariaAttributes}
      options={(commonProps as { options: Array<Option> }).options.map((o) => ({
        ...o,
        icon: LucideLocateFixed,
      }))}
      renderSelectedTrigger={({ option, iconNode }) =>
        renderRow(option, iconNode)
      }
      renderOption={({ option, iconNode }) => renderRow(option, iconNode)}
    />
  );
};

export default SelectFindingRenderer;
