import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { BadgeItem } from "@/components/ui/BadgeGroup";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { Badge } from "@/components/ui/badge";
import { useFieldMultiSelectData } from "@/components/ui/fields/fields.utils";
import { LucideAsteriskSquare, LucideAtSign } from "lucide-react";
import { useEffect } from "react";
import type { LocationApiOption } from "../common/Location.interfaces";
import { LocationOptionRow } from "../common/LocationOptionRow";
import type { Renderer } from "../renderers.interfaces";

const MultiSelectLocationRenderer: Renderer = ({
  field,
  controller,
  utils,
  data,
  id,
  style,
  ...ariaAttributes
}) => {
  const { commonProps } = useFieldMultiSelectData(
    field,
    controller,
    data?.apiOptions as SelectFieldOptions
  );

  // Clear stale selected values if they don't exist in current options (e.g., parent finding changed)
  const current = commonProps as unknown as {
    value: string[];
    options: Array<Option>;
    onValueChange: (vals: string[]) => void;
  };
  useEffect(
    function clearStaleMultiLocationSelections() {
      const selected = Array.isArray(current.value) ? current.value : [];
      if (selected.length === 0) return;
      const optionSet = new Set(current.options.map((o) => o.value));
      const filtered = selected.filter((v) => optionSet.has(v));
      if (filtered.length !== selected.length) {
        current.onValueChange(filtered);
      }
    },
    [current]
  );

  if (field.uiMetadata?.renderer?.name !== "location") return null;

  return (
    <EsiSelect
      {...commonProps}
      id={id}
      style={style}
      {...ariaAttributes}
      placeholder="Select locations..."
      emptyState="No locations found"
      selectedBadgeProps={(): Partial<BadgeItem> => {
        return {
          className: "pl-1.5",
          icon: LucideAsteriskSquare,
        };
      }}
      renderSelectedBadge={({
        option,
        removeNode,
        iconNode,
      }: {
        option: { value: string; label: string };
        removeNode: React.ReactNode;
        iconNode?: React.ReactNode;
      }) => {
        const decoded = utils.deserializeFieldValueFromString(
          option.value
        ) as LocationApiOption | null;
        const hasProperty = Boolean(decoded?.remoteRef?.property);
        const keyPath = decoded?.remoteRef?.key;
        const storeName = decoded?.name || "Unknown";
        const dominantKey = keyPath || option.label;

        return (
          <>
            {iconNode}
            <span className="font-semibold leading-none">
              {dominantKey}
              {hasProperty && (
                <span className="leading-none font-bold text-muted-foreground">
                  .{decoded?.remoteRef?.property}
                </span>
              )}
            </span>
            <div className="flex items-center -mr-0.5">
              <Badge
                variant="outline"
                className="leading-none pl-1.5 -my-px font-medium flex items-center gap-1 border-transparent"
              >
                <LucideAtSign className="size-2.5 text-muted-foreground -ml-0.5" />
                {storeName}
              </Badge>
            </div>

            {removeNode}
          </>
        );
      }}
      renderOption={({ option, checkboxNode }) => {
        const decodedValue = utils.deserializeFieldValueFromString(
          option.value
        );
        const locationData =
          typeof decodedValue === "object" && decodedValue !== null
            ? (decodedValue as LocationApiOption)
            : null;

        return (
          <LocationOptionRow
            label={option.label}
            checkboxNode={checkboxNode}
            decoded={locationData}
          />
        );
      }}
    />
  );
};

export default MultiSelectLocationRenderer;
