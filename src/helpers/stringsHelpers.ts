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
  }
   catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    console.error('Invalid URL:', url);
    return url; // Return the original URL
  }
};
