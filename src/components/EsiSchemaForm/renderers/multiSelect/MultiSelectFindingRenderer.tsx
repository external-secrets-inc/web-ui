import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { BadgeItem } from "@/components/ui/BadgeGroup";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { useFieldMultiSelectData } from "@/components/ui/fields/fields.utils";
import { LucideLocateFixed } from "lucide-react";
import { useEffect, useMemo } from "react";
import { FindingOptionRow } from "../common/FindingOptionRow";
import type { Renderer } from "../renderers.interfaces";
import type { FindingRendererItem } from "../common/Finding.interfaces";

const MultiSelectFindingRenderer: Renderer = ({
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

  const isFinding = field.uiMetadata?.renderer?.name === "finding";

  const renderer = field.uiMetadata?.renderer as
    | { name: "finding"; metadata?: Record<string, FindingRendererItem> }
    | undefined;
  const metadataMap: Record<string, FindingRendererItem> = useMemo(
    () => (isFinding ? renderer?.metadata ?? {} : {}),
    [isFinding, renderer]
  );

  const metaByName = useMemo(() => {
    const map = new Map<string, FindingRendererItem>();
    Object.values(metadataMap).forEach((m) => {
      if (m?.name) map.set(m.name, m);
    });
    return map;
  }, [metadataMap]);

  const optionsFromMetadata: Option[] = useMemo(() => {
    return Object.values(metadataMap).map((meta) => {
      const name = meta?.name ?? meta?.id ?? "";
      const label = meta?.displayName || name || "Unknown";
      // Keep value shape consistent with anyOf.valueRef { name: "${name}" }
      const encoded = utils.serializeFieldValueToString({ name });
      return {
        label,
        value: encoded,
        icon: LucideLocateFixed,
      } as Option;
    });
  }, [metadataMap, utils]);

  // Clear stale selections if they no longer exist in current metadata options
  const current = commonProps as unknown as {
    value: string[];
    onValueChange: (vals: string[]) => void;
  };
  useEffect(
    function clearStaleMultiFindingSelections() {
      const selected = Array.isArray(current.value) ? current.value : [];
      if (selected.length === 0) return;
      const optionSet = new Set(optionsFromMetadata.map((o) => o.value));
      const filtered = selected.filter((v) => optionSet.has(v));
      if (filtered.length !== selected.length) {
        current.onValueChange(filtered);
      }
    },
    [current, optionsFromMetadata]
  );

  if (!isFinding) return null;

  return (
    <EsiSelect
      {...commonProps}
      id={id}
      style={style}
      {...ariaAttributes}
      placeholder="Select findings..."
      emptyState="No findings found"
      options={optionsFromMetadata}
      selectedBadgeProps={(): Partial<BadgeItem> => ({
        className: "pl-1.5",
        icon: LucideLocateFixed,
      })}
      renderSelectedBadge={({
        option,
        iconNode,
        removeNode,
      }: {
        option: Option;
        resolved: BadgeItem;
        labelNode: React.ReactNode;
        iconNode?: React.ReactNode;
        remove: () => void;
        removeNode: React.ReactNode;
      }) => {
        const decoded = utils.deserializeFieldValueFromString(option.value) as {
          name?: string;
        } | null;
        const meta = decoded?.name ? metaByName.get(decoded.name) : undefined;
        return (
          <>
            <FindingOptionRow
              meta={meta}
              fallbackLabel={option.label}
              iconNode={iconNode}
              variant="badge"
            />
            {removeNode}
          </>
        );
      }}
      renderOption={({ option, checkboxNode, iconNode }) => {
        const decoded = utils.deserializeFieldValueFromString(option.value) as {
          name?: string;
        } | null;
        const meta = decoded?.name ? metaByName.get(decoded.name) : undefined;
        return (
          <FindingOptionRow
            meta={meta}
            fallbackLabel={option.label}
            iconNode={iconNode}
            checkboxNode={checkboxNode}
            variant="option"
          />
        );
      }}
    />
  );
};

export default MultiSelectFindingRenderer;
