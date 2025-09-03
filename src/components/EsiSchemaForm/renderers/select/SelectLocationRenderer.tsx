import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { Badge } from "@/components/ui/badge";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { useFieldSelectData } from "@/components/ui/fields/fields.utils";
import { LucideAsteriskSquare, LucideAtSign } from "lucide-react";
import { useEffect } from "react";
import type { LocationApiOption } from "../common/Location.interfaces";
import { LocationOptionRow } from "../common/LocationOptionRow";
import type { Renderer } from "../renderers.interfaces";

const SelectLocationRenderer: Renderer = ({
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

  // Clear stale selected value if it does not exist in the current option set (e.g., parent finding changed)
  const current = commonProps as unknown as {
    value: string | null;
    options: Array<Option>;
  };
  useEffect(
    function clearStaleSingleLocationSelection() {
      const selected = current.value;
      if (!selected) return;
      const exists = current.options.some((o) => o.value === selected);
      if (!exists) {
        controller.onChange("");
      }
    },
    [current.value, current.options, controller]
  );

  if (field.uiMetadata?.renderer?.name !== "location") return null;

  return (
    <EsiSelect
      {...commonProps}
      id={id}
      style={style}
      {...ariaAttributes}
      options={(commonProps as { options: Array<Option> }).options.map((o) => ({
        ...o,
        icon: LucideAsteriskSquare,
      }))}
      placeholder="Select a location..."
      emptyState="No locations found"
      renderSelectedTrigger={({ option, iconNode }) => {
        const decoded = utils.deserializeFieldValueFromString(
          option.value
        ) as LocationApiOption | null;
        const hasProperty = Boolean(decoded?.remoteRef?.property);
        const storeName = decoded?.name || "Unknown Store";
        const keyPath = decoded?.remoteRef?.key;
        const dominantKey = keyPath || option.label;

        return (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 min-w-0 inline-flex items-center gap-2">
              {iconNode}
              <span className="text-sm font-semibold leading-none text-foreground truncate">
                {dominantKey}
                {hasProperty && (
                  <span className="leading-none font-bold text-muted-foreground">
                    .{decoded?.remoteRef?.property}
                  </span>
                )}
              </span>
              <Badge
                variant="outline"
                className="flex items-center gap-1 pl-1.5"
              >
                <LucideAtSign className="size-3 text-muted-foreground" />
                {storeName}
              </Badge>
            </div>
          </div>
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

export default SelectLocationRenderer;
