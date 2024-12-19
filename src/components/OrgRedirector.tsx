import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function OrgRedirector({ children }: { children: React.ReactNode }) {
  const currentPath = window.location.pathname;
  const { org } = useParams();
  const loggedOrg = Cookies.get('_auth_state') ?
    JSON.parse(Cookies.get('_auth_state') || '{}').tenant
    : null;

  const navigate = useNavigate();
  useEffect(() => {
    if (org && loggedOrg && org !== loggedOrg) {
      const subpath = currentPath.split('/')[2];
      if (subpath) {
        navigate(currentPath.replace(org, loggedOrg), { replace: true });
      } else {
        navigate(`/${loggedOrg}${currentPath}`, { replace: true });
      }
    }
  }, [currentPath, org, loggedOrg, navigate]);

  return <>{children}</>
}