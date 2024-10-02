import React from 'react';
import { Link } from 'react-router-dom';
import { LucideExternalLink } from 'lucide-react';
import useOrgLink from '@/hooks/useOrgLink';
import { SheetClose } from '@/components/ui/sheet';

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
        <Link
          to={getOrgLink('/agents')}
          className="text-foreground transition-colors hover:text-foreground"
        >
          Agents
        </Link>
      </LinkWrapper>
      <LinkWrapper>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-foreground transition-colors hover:text-foreground md:ml-auto"
        >
          Docs
          <LucideExternalLink className='ml-2' />
        </a>
      </LinkWrapper>
    </>
  );
};

export default NavLinks;