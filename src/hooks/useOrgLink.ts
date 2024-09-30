import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/types';

const useOrgLink = () => {
  const authUser = useAuthUser<IUserData>();

  const getOrgLink = (path: string) => {
    const user = authUser;
    const organizationURL = user?.tenant;
    if (organizationURL) {
      return `/${organizationURL}${path}`;
    } else {
      console.warn('Tenant information is missing.');
      return path; // Fallback to the original path
    }
  };

  return getOrgLink;
};

export default useOrgLink;