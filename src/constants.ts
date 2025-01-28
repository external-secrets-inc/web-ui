import { stripURLProtocol } from '@/helpers/stringsHelpers';

// Domains and URLs
export const TENANT_MANAGER_DOMAIN = import.meta.env.VITE_API_DOMAIN;
export const AUDIT_POC_DOMAIN = import.meta.env.VITE_AUDIT_POC_DOMAIN;
export const API_DOMAIN = TENANT_MANAGER_DOMAIN;
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;
export const DOCS_DOMAIN = import.meta.env.VITE_DOCS_DOMAIN;
export const WEBSITE_DOMAIN = import.meta.env.VITE_WEBSITE_DOMAIN;

export const API_DOMAIN_STRIPPED = stripURLProtocol(API_DOMAIN);
export const APP_DOMAIN_STRIPPED = stripURLProtocol(APP_DOMAIN);
export const DOCS_DOMAIN_STRIPPED = stripURLProtocol(DOCS_DOMAIN);
export const WEBSITE_DOMAIN_STRIPPED = stripURLProtocol(WEBSITE_DOMAIN);

// Date and time
export const ONE_SECOND_IN_MILLISECONDS = 1000
export const ONE_MINUTE_IN_SECONDS = 60;

// Variants
export const POLICY_STATUS_COLORS = {
  compliant: "text-emerald-500",
  non_compliant: "text-destructive",
  error: "text-orange-500",
};
export const POLICY_STATUS_BADGE_COLORS = {
  compliant: "border-emerald-500",
  non_compliant: "border-destructive",
  error: "border-orange-500",
};
