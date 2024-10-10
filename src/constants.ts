import { stripURLProtocol } from '@/helpers/stringsHelpers';

export const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN;
export const DOCS_DOMAIN = import.meta.env.VITE_DOCS_DOMAIN;
export const WEBSITE_DOMAIN = import.meta.env.VITE_WEBSITE_DOMAIN;

export const API_DOMAIN_STRIPPED = stripURLProtocol(API_DOMAIN);
export const APP_DOMAIN_STRIPPED = stripURLProtocol(APP_DOMAIN);
export const DOCS_DOMAIN_STRIPPED = stripURLProtocol(DOCS_DOMAIN);
export const WEBSITE_DOMAIN_STRIPPED = stripURLProtocol(WEBSITE_DOMAIN);