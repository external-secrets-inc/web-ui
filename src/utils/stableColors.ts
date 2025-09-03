/**
 * Utility functions for generating stable, deterministic colors based on seeds.
 * Uses Tailwind's default color palette for consistency with the design system.
 */

import { stableHashSelect, type HashableValue } from "./stableHash";

/**
 * Curated subset of Tailwind default color palette for stable color generation.
 * Excludes colors that might be too similar or not suitable for UI elements.
 */
const TAILWIND_COLOR_NAMES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
] as const;

/**
 * Generates stable CSS variables for any number of color properties.
 * Returns CSS variable names that can be used with Tailwind's arbitrary value syntax.
 *
 * @param seed - The value to generate stable colors from (e.g., user ID, item ID, etc.)
 * @param colorConfigs - Array of color configurations specifying shade, alpha, and CSS variable name
 * @returns CSS properties object with the specified variable names
 *
 * @example
 * ```typescript
 * // Single color
 * const colors = generateStableColors("user123", [
 *   { shade: 500, var: "--user-color" }
 * ]);
 * // Result: { "--user-color": "var(--color-red-500)" }
 *
 * // Multiple colors with alpha
 * const colors = generateStableColors("user123", [
 *   { shade: 100, var: "--bg-color" },
 *   { shade: 500, alpha: 0.8, var: "--border-color" },
 *   { shade: 700, var: "--text-color" }
 * ]);
 * // Result: {
 * //   "--bg-color": "var(--color-red-100)",
 * //   "--border-color": "rgba(var(--color-red-500), 0.8)",
 * //   "--text-color": "var(--color-red-700)"
 * // }
 * ```
 */
export function generateStableColors(
  seed: HashableValue,
  colorConfigs: Array<{ shade: number; alpha?: number; var: string }>
): React.CSSProperties {
  const colorName = stableHashSelect(seed, TAILWIND_COLOR_NAMES);

  const result: Record<string, string> = {};
  for (const config of colorConfigs) {
    if (config.alpha !== undefined) {
      // Use rgba with alpha for transparency
      result[config.var] = `rgba(var(--color-${colorName}-${config.shade}), ${config.alpha})`;
    } else {
      // Use solid color
      result[config.var] = `var(--color-${colorName}-${config.shade})`;
    }
  }

  return result as React.CSSProperties;
}


