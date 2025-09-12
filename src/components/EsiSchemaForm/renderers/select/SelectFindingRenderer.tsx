import type { SelectFieldOptions } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { EsiSelect } from "@/components/ui/EsiSelect";
import type { Option } from "@/components/ui/EsiSelect/EsiSelect";
import { useFieldSelectData } from "@/components/ui/fields/fields.utils";
import { LucideLocateFixed } from "lucide-react";
import { FindingOptionRow } from "../common/FindingOptionRow";
import { resolveFindingFromValue } from "../common/Finding.utils";
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

  function resolveFinding(
    optionValue: string
  ): FindingRendererItem | undefined {
    return resolveFindingFromValue(optionValue, field.id, metadataMap, utils.deserializeFieldValueFromString);
  }

  function renderRow(option: Option, iconNode: React.ReactNode) {
    const meta = resolveFinding(option.value);
    return (
      <FindingOptionRow
        meta={meta}
        fallbackLabel={option.label}
        iconNode={iconNode}
      />
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
