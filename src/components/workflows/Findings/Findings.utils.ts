import type { Finding, FindingLocation } from "./Findings.interfaces";

/**
 * Determines the most frequently occurring key from a finding's locations.
 * This is used to identify the "main" or "dominant" secret key.
 */
export function getDominantKey(finding: Finding | { locations?: FindingLocation[] }): string | undefined {
  const counts = new Map<string, number>();
  for (const loc of finding.locations ?? []) {
    const k = loc?.remoteRef?.key;
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let bestKey: string | undefined;
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  });
  return bestKey;
}

/**
 * Extracts unique store names from a finding's locations.
 */
export function getStoreNames(locations: FindingLocation[]): string[] {
  return [
    ...new Set(
      locations
        .map((l) => l.name ?? "")
        .filter(Boolean)
    ),
  ];
}

/**
 * Counts the number of locations that have property selectors.
 */
export function getPropertyCount(locations: FindingLocation[]): number {
  return locations.reduce((total, l) => {
    const prop = l.remoteRef?.property;
    if (!prop) return total;
    const v = String(prop).trim();
    if (v === "" || v === "-") return total;
    return total + 1;
  }, 0);
}

/**
 * Gets all unique keys from locations that are different from the dominant key.
 */
export function getDuplicateKeys(locations: FindingLocation[], dominantKey?: string): string[] {
  return [
    ...new Set(
      locations
        .map((l) => l.remoteRef?.key)
        .filter(
          (key): key is string =>
            key !== undefined && key !== "" && key !== dominantKey
        )
    ),
  ];
}
