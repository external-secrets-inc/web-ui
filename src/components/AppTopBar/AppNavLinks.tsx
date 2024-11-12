import { SheetClose } from '@/components/ui/sheet';
import { LucideExternalLink } from 'lucide-react';
import React from 'react';
import OrgNavLink from './OrgNavLink.tsx';

interface NavLinksProps {
  closeSheetOnClick?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ closeSheetOnClick }) => {
  const docsUrl = `${import.meta.env.VITE_DOCS_DOMAIN}/docs`;

  const LinkWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    closeSheetOnClick ? <SheetClose asChild>{children}</SheetClose> : <>{children}</>
  );

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
      <LinkWrapper>
        <OrgNavLink
          path='/audit'
          title='Audit'
        />
      </LinkWrapper>
      <LinkWrapper>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors text-muted-foreground hover:text-foreground md:ml-auto flex items-center"
        >
          Docs
          <LucideExternalLink className='ml-2' />
        </a>
      </LinkWrapper>
    </>
  );
};

export default NavLinks;
