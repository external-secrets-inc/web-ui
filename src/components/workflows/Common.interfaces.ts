import { BadgeProps } from "../ui/badge";

export interface Status {
  status: string;
  reason: string;
  message?: string;
}

type Rule = {
  variant: BadgeProps["variant"];
  display?: string | ((s: Status) => string);
  message?: string | ((s: Status) => string);
};

export type StatusMap = Record<string, Rule>;
