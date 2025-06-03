import LogoEsiSidebarDarkMode from '@/assets/logo-esi-sidebar-dark-mode.svg?react';
import LogoEsiSidebarLightMode from '@/assets/logo-esi-sidebar-light-mode.svg?react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function LayoutSidebarAppLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex", className)}>
      <LogoEsiSidebarDarkMode className="h-8 hidden dark:inline" />
      <LogoEsiSidebarLightMode className="h-8 dark:hidden" />
    </Link>
  );
};
