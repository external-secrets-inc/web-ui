import { SheetClose } from '@/components/ui/sheet';
import useOrgLink from '@/hooks/useOrgLink';
import { LucideExternalLink } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavLinksProps {
  closeSheetOnClick?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ closeSheetOnClick }) => {
  const getOrgLink = useOrgLink();
  const docsUrl = `${import.meta.env.VITE_DOCS_DOMAIN}/docs`;

  const LinkWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    closeSheetOnClick ? <SheetClose asChild>{children}</SheetClose> : <>{children}</>
  );

  return (
    <>
      <LinkWrapper>
        <NavLink
          to={getOrgLink('/agents')}
          className="transition-colors text-muted-foreground hover:text-foreground [&:is(.active)]:text-foreground"
        >
          Agents
        </NavLink>
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