import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface DetailsCardField {
  label: string;
  icon?: LucideIcon;
  value: ReactNode;
  className?: string;
}

export interface DetailsCardProps {
  icon?: LucideIcon;
  title: string;
  fields?: DetailsCardField[];
  className?: string;
  children?: ReactNode;
}

export interface DetailsCardFieldProps {
  label: string;
  icon?: LucideIcon;
  value: ReactNode;
  className?: string;
}

