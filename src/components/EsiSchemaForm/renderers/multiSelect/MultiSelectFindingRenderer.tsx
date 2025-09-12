import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import type { BadgeItem } from "@/components/ui/BadgeGroup";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { useFieldMultiSelectData } from "@/components/ui/fields/fields.utils";
import { LucideLocateFixed } from "lucide-react";
import { FindingOptionRow } from "../common/FindingOptionRow";
import { resolveFindingFromValue } from "../common/Finding.utils";
import type { Renderer } from "../renderers.interfaces";
import type { FindingRendererItem } from "../select/SelectFindingRenderer";

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

  if (field.uiMetadata?.renderer?.name !== "finding") return null;

  const renderer = field.uiMetadata?.renderer as
    | { name: "finding"; metadata?: Record<string, FindingRendererItem> }
    | undefined;
  const metadataMap: Record<string, FindingRendererItem> = renderer?.metadata ?? {};

  function resolveFinding(optionValue: string): FindingRendererItem | undefined {
    return resolveFindingFromValue(optionValue, field.id, metadataMap, utils.deserializeFieldValueFromString);
  }

  return (
    <EsiSelect
      {...commonProps}
      id={id}
      style={style}
      {...ariaAttributes}
      placeholder="Select findings..."
      emptyState="No findings found"
      options={(commonProps as { options: Array<Option> }).options.map((o) => ({
        ...o,
        icon: LucideLocateFixed,
      }))}
      selectedBadgeProps={(option: Option): Partial<BadgeItem> => {
        const meta = resolveFinding(option.value);
        return {
          className: "pl-1.5",
          icon: LucideLocateFixed,
          children: ({ iconNode }) => (
            <FindingOptionRow
              meta={meta}
              fallbackLabel={option.label}
              iconNode={iconNode}
              variant="badge"
            />
          ),
        };
      }}
    />
  );
};

export default MultiSelectFindingRenderer;


