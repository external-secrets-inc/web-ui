export const createSlug = (value: string): string => {
  // First convert to lowercase and replace spaces with hyphens
  let slug = value.toLowerCase().replace(/\s+/g, '-');

  // Then remove special characters except hyphens and underscores
  slug = slug.replace(/[^a-z0-9-_]/g, "");

  // Collapse consecutive hyphens/underscores
  slug = slug.replace(/[-_]+/g, "-");
  // Trim leading/trailing hyphens/underscores
  slug = slug.replace(/^[-_]+|[-_]+$/g, "");

  return slug;
};

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:(?:-|_)+[a-z0-9]+)*$/.test(value);
};