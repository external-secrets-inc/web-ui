import { generateStableColors } from "@/utils/stableColors";
import { stableHash } from "@/utils/stableHash";
import type { Finding, FindingLocation } from "./Findings.interfaces";

export interface GroupedLocation {
  storeName: string;
  duplicateKeys: string[];
  properties: string[];
}


export function equalLocation(a: FindingLocation, b: FindingLocation) : boolean {
  return a.kind === b.kind &&
  a.apiVersion === b.apiVersion &&
  a.name === b.name &&
  a.remoteRef.key === b.remoteRef.key &&
  a.remoteRef.property === b.remoteRef.property;
}

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

/**
 * Returns the first non-empty property associated with the dominant key.
 */
export function getPropertyForDominantKey(
  finding: Finding | { locations?: FindingLocation[] },
  dominantKey?: string
): string | undefined {
  const key = dominantKey ?? getDominantKey(finding);
  if (!key) return undefined;

  for (const loc of finding.locations ?? []) {
    const k = loc?.remoteRef?.key;
    if (k !== key) continue;
    const propRaw = loc?.remoteRef?.property;
    const prop = typeof propRaw === "string" ? propRaw.trim() : "";
    if (prop !== "" && prop !== "-") {
      return prop;
    }
  }
  return undefined;
}

/**
 * Groups locations by store name, consolidating duplicate keys and properties.
 */
export function groupLocationsByStore(locations: FindingLocation[]): GroupedLocation[] {
  const storeNames = getStoreNames(locations);

  return storeNames.map(storeName => {
    const storeLocations = locations.filter(loc => loc.name === storeName);
    const duplicateKeys = storeLocations
      .map(loc => loc.remoteRef?.key)
      .filter((key): key is string => key !== undefined && key !== "");
    const properties = storeLocations
      .map(loc => loc.remoteRef?.property)
      .filter((property): property is string =>
        property !== undefined && property !== "" && property !== "-"
      );

    return {
      storeName,
      duplicateKeys: [...new Set(duplicateKeys)],
      properties: [...new Set(properties)],
    };
  });
}

/**
 * Derives a short, deterministic 3-character uppercase fingerprint from the
 * provided identifier. Intended for compact visual identity only; not
 * cryptographically secure. Stable across sessions for the same input.
 */
export function computeFindingFingerprint(finding: Pick<Finding, "id">): string {
  return stableHash(finding.id, {
    length: 3,
  }) as string;
}

/**
 * Computes stable CSS variables for fingerprint badge colors.
 * Uses the generic stable color utility for consistency.
 */
export function computeFingerprintCssVars(seed: Finding["id"]): React.CSSProperties {
  return generateStableColors(seed, [
    // Border color akin to border-*/60
    { shade: 500, alpha: 0.6, var: "--color-border" },
    // Subtle ring color akin to ring-*/15
    { shade: 500, alpha: 0.15, var: "--color-ring" },
    // Gradient overlay similar to bg-gradient-to-tr from-*/0 to-*/15 dark:to-*/35
    { shade: 500, alpha: 0, var: "--color-grad-from" },
    { shade: 500, alpha: 0.15, var: "--color-grad-to" },
    { shade: 500, alpha: 0.35, var: "--color-grad-to-dark" },
    // Text tint
    { shade: 600, var: "--color-text" }
  ]);
}
