import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Represents a single field within a DetailsCard.
 */
export interface DetailsCardField {
  /** The label text displayed above the value */
  label: string;
  /** Optional Lucide icon displayed before the label */
  icon?: LucideIcon;
  /** The content to display as the field value (automatically styled with font-mono) */
  value: ReactNode;
  /** Optional additional CSS classes for the field container */
  className?: string;
}

/**
 * Represents a section within a DetailsCard with its own title and fields.
 */
export interface DetailsCardSection {
  /** The section heading text */
  title: string;
  /** Optional Lucide icon displayed before the section title */
  icon?: LucideIcon;
  /** Array of fields to display within this section */
  fields: DetailsCardField[];
}

/**
 * Props for the DetailsCard component.
 *
 * Supports multiple usage patterns:
 * - Props-based: Pass `fields` array for automatic grid rendering
 * - Multi-section: Pass `sections` array for divided content with headings and separators
 * - Children-based: Pass custom JSX `children` for full layout control
 * - Hybrid: Use any combination of fields, sections, and children together
 */
export interface DetailsCardProps {
  /** Optional Lucide icon displayed next to the card title */
  icon?: LucideIcon;
  /** The main card title text */
  title: string;
  /** Optional array of fields to render in a responsive auto-fit grid at the top of the card */
  fields?: DetailsCardField[];
  /** Optional array of sections with their own titles, icons, and fields (rendered below fields with separators) */
  sections?: DetailsCardSection[];
  /** Optional additional CSS classes for the card */
  className?: string;
  /** Optional custom content to render at the bottom of the card (below fields and sections) */
  children?: ReactNode;
}

/**
 * Props for the standalone DetailsCardField component.
 */
export interface DetailsCardFieldProps {
  /** The label text displayed above the value */
  label: string;
  /** Optional Lucide icon displayed before the label */
  icon?: LucideIcon;
  /** The content to display as the field value */
  value: ReactNode;
  /** Optional additional CSS classes for the field container */
  className?: string;
}

