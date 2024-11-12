import useOrgLink from '@/hooks/useOrgLink';
import { NavLink } from 'react-router-dom';

interface OrgNavLinkProps {
  path: string;
  title: string;
}

function OrgNavLink({path, title} : OrgNavLinkProps) {
  const getOrgLink = useOrgLink();

  return (
      <NavLink
        to={getOrgLink(path)}
        className="transition-colors text-muted-foreground hover:text-foreground [&:is(.active)]:text-foreground"
      >
        {title}
      </NavLink>
  )
}

export default OrgNavLink;
