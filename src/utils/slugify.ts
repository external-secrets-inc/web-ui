export const createSlug = (value: string): string => {
  // First convert to lowercase and remove special characters except hyphens and underscores
  let slug = value.toLowerCase().replace(/[^a-z0-9-_]/g, "");

  // Replace consecutive hyphens or underscores with a single hyphen
  slug = slug.replace(/[-_]+/g, "-");

  // Remove leading/trailing hyphens and underscores
  slug = slug.replace(/^[-_]+|[-_]+$/g, "");

  // Ensure it starts and ends with a letter or number
  if (!/^[a-z0-9]/.test(slug)) {
    slug = "a" + slug;
  }
  if (!/[a-z0-9]$/.test(slug)) {
    slug = slug + "a";
  }

  return slug;
};

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:(?:-|_)+[a-z0-9]+)*$/.test(value);
};