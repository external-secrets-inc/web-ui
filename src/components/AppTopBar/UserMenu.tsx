import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useOrgLink from '@/hooks/useOrgLink';
import { IUserData } from '@/types';
import { LucideChevronDown } from 'lucide-react';
import React from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { Link, useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const authUser = useAuthUser<IUserData>();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const tenant = authUser?.tenant;
  const name = authUser?.name;
  const initials = getInitials(name);
  const getOrgLink = useOrgLink();

  const handleSignOut = () => {
    signOut();
    analytics.track('Signed Out', { mannually: true });
    navigate('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Toggle user menu"
          className="flex gap-2 h-auto px-1 md:pr-3 py-1"
        >
          <Avatar className="md:h-10 md:w-10 h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <span className="flex-col items-start gap-1 hidden md:flex">
            <span className="inline-flex gap-1">
              <span className='font-normal leading-none max-w-36 text-ellipsis text-nowrap overflow-hidden'>
                {name}
              </span>
              <LucideChevronDown className="text-muted-foreground" />
            </span>
            <span className="font-normal leading-none text-xs text-muted-foreground max-w-36 text-ellipsis text-nowrap overflow-hidden">
              {tenant}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuLabel className="md:hidden">
          <span className="flex-col text-start items-start gap-1 flex">
            <span className="font-normal leading-none">{name}</span>
            <span className="font-normal leading-none text-xs text-muted-foreground max-w-36 text-ellipsis text-nowrap overflow-hidden">
              {tenant}
            </span>
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="md:hidden" />

        <Link to={getOrgLink('/settings')}>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>

        <DropdownMenuItem onClick={handleSignOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getInitials(name: string | undefined): string {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials.slice(0, 2);
}

export default UserMenu;