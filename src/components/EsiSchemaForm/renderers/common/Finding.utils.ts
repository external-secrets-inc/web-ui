import type { FindingRendererItem } from "../select/SelectFindingRenderer";

/**
 * Extracts the finding ID from a field value.
 *
 * Strategy: option.value is a dotted path like "<field.id>.<findingId>" (to submit a rich manifest value).
 * UI needs the plain findingId to read `uiMetadata.renderer.metadata[findingId]`.
 * Remove the exact "<field.id>." prefix; if absent, use the last dotted segment.
 */
export function getFindingIdFromValue(
  rawValue: string,
  fieldId: string,
  deserialize: (s: string) => unknown
): string {
  const decoded = deserialize(rawValue);
  const value = typeof decoded === "string" ? decoded : rawValue;
  const prefix = `${fieldId}.`;
  if (value.startsWith(prefix)) return value.slice(prefix.length);
  const lastDot = value.lastIndexOf(".");
  return lastDot < 0 ? value : value.slice(lastDot + 1);
}

/**
 * Resolves finding metadata from an option value using the provided metadata map.
 */
export function resolveFindingFromValue(
  optionValue: string,
  fieldId: string,
  metadataMap: Record<string, FindingRendererItem>,
  deserialize: (s: string) => unknown
): FindingRendererItem | undefined {
  const id = getFindingIdFromValue(optionValue, fieldId, deserialize);
  return metadataMap[id];
}
