/**
 * Utility functions for generating stable, deterministic hashes from arbitrary input.
 * Uses a djb2-style hash algorithm for consistent results across sessions.
 */

/**
 * Type for values that can be converted to a string for hashing.
 * Includes all primitive types and objects with a toString method.
 */
export type HashableValue = string | number | boolean | null | undefined | { toString(): string };

/**
 * Generates a stable hash from any input value.
 * Can return a raw number or a formatted string based on options.
 *
 * @param input - The value to hash (will be converted to string)
 * @param options - Optional configuration for string output
 * @param options.length - Length for string output (if not provided, returns number)
 * @param options.charset - Character set to use for string output (default: alphanumeric uppercase)
 * @returns A positive integer hash value OR a stable string based on options
 *
 * @example
 * ```typescript
 * // Raw number hash
 * stableHash("user123") // Always returns the same number
 * stableHash({ id: "user123" }) // Same result as above
 * stableHash(null) // Returns hash for empty string
 *
 * // String hash (like fingerprint)
 * stableHash("user123", { length: 3 }) // Always returns something like "A7B"
 * stableHash("user123", { length: 5 }) // Always returns something like "A7B2C"
 * stableHash("user123", { length: 3, charset: "0123456789" }) // Always returns something like "742"
 * ```
 */
export function stableHash(
  input: HashableValue,
  options?: { length: number; charset?: string }
): number | string {
  const s = String(input ?? "");
  let hash = 5381;

  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) ^ s.charCodeAt(i);
  }

  const absHash = Math.abs(hash);

  // If length is specified, return formatted string
  if (options?.length !== undefined) {
    const desiredLength = options.length;

    // Default behavior: use true base36 representation like the original
    if (!options.charset) {
      const base36 = absHash.toString(36).toUpperCase();
      const sliced = base36.slice(0, desiredLength);
      return sliced.padEnd(desiredLength, "X");
    }

    // Custom charset: produce base-N representation analogous to base36
    const charset = options.charset;
    const base = charset.length;
    if (base < 2) throw new Error("Charset must contain at least 2 characters");

    let n = absHash;
    let out = "";
    if (n === 0) out = charset[0];
    while (n > 0 && out.length < desiredLength) {
      const digit = n % base;
      out = charset[digit] + out; // prepend to build most-significant first
      n = Math.floor(n / base);
    }

    if (out.length < desiredLength) {
      out = out.padEnd(desiredLength, charset[0]);
    } else if (out.length > desiredLength) {
      out = out.slice(0, desiredLength);
    }
    return out;
  }

  // Otherwise return raw number
  return absHash;
}

/**
 * Generates a stable hash and maps it to a value from a given array.
 * Useful for selecting colors, icons, or any other deterministic choice.
 *
 * @param input - The value to hash
 * @param options - Array of options to choose from
 * @returns The selected option from the array
 *
 * @example
 * ```typescript
 * const colors = ['red', 'blue', 'green'];
 * stableHashSelect("user123", colors) // Always returns the same color for "user123"
 *
 * const icons = [LucideUser, LucideMail, LucidePhone];
 * stableHashSelect(user.id, icons) // Always returns the same icon for that user
 * ```
 */
export function stableHashSelect<T>(
  input: HashableValue,
  options: readonly T[]
): T {
  if (options.length === 0) {
    throw new Error("Options array cannot be empty");
  }

  const hash = stableHash(input) as number;
  const index = hash % options.length;
  return options[index];
}
