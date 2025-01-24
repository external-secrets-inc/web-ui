import { SheetClose } from '@/components/ui/sheet';
import { LucideExternalLink, LucideMoon, LucideSun } from 'lucide-react';
import React from 'react';
import OrgNavLink from './OrgNavLink.tsx';
import { useTheme } from "@/components/ThemeProvider";
import { Button } from '@/components/ui/button';

interface NavLinksProps {
  closeSheetOnClick?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ closeSheetOnClick }) => {
  const docsUrl = `${import.meta.env.VITE_DOCS_DOMAIN}/docs`;
  const { theme, setTheme } = useTheme();

  const LinkWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    closeSheetOnClick ? <SheetClose asChild>{children}</SheetClose> : <>{children}</>
  );

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <LinkWrapper>
        <OrgNavLink
          path='/agents'
          title='Agents'
        />
      </LinkWrapper>
      <LinkWrapper>
        <OrgNavLink
          path='/rotators'
          title='Async Rotators'
        />
      </LinkWrapper>
      {/* TODO: Remove mock variable when audit is ready https://github.com/external-secrets-inc/web-ui/issues/124*/}
      {import.meta.env.VITE_MOCK_AUDIT_ROUTE && <LinkWrapper>
        <OrgNavLink
          path='/audit'
          title='Audit'
        />
      </LinkWrapper>}
      <LinkWrapper>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="md:ml-auto"
        >
          {theme === 'dark' ? <LucideSun className="h-6 w-6" /> : <LucideMoon className="h-6 w-6" />}
        </Button>
      </LinkWrapper>
      <LinkWrapper>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors text-muted-foreground hover:text-foreground flex items-center"
        >
          Docs
          <LucideExternalLink className='ml-2' />
        </a>
      </LinkWrapper>
    </>
  );
};

export default NavLinks;
