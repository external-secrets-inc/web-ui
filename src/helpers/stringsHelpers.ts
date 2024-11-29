/**
 * Strips the protocol from a given URL.
 *
 * @param url - The URL string from which to strip the protocol.
 * @returns The URL without the protocol.
 */
export const stripURLProtocol = (url: string): string => {
  if (typeof URL === 'undefined') {
    console.error('URL API is not available in this environment.');
    return url; // Return the original URL
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.host;
  } catch (error) {
    console.error('Invalid URL:', url);
    return url; // Return the original URL
  }
};

/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string that will be capitalized.
 * @returns The capitalized version of the string.
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize the all words of a string.
 *
 * @param str - The string that will be capitalized.
 * @returns The capitalized version of the string.
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
