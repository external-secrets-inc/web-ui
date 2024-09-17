import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LogoEsiFullWhite from '@/assets/logo-esi-full-white.svg?react';
import LogoEsiWhite from '@/assets/logo-esi-white.svg?react';

const AppTopBar: React.FC = () => {
  const authUser = useAuthUser<IUserData>();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const tenant = authUser?.tenant;
  const name = authUser?.name;
  const initials = getInitials(name);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 flex h-12 md:h-16 items-center gap-4 border-b bg-background px-6 z-10">
      <nav className="font-medium flex flex-row items-center gap-6 md:gap-8 text-sm">
        <Link to="/">
          <LogoEsiFullWhite className="h-9 hidden md:block" />
          <LogoEsiWhite className="h-6 md:hidden" />
        </Link>
        <div className="flex gap-4">
          <Link
            to={`/${tenant}/agents`}
            className="text-foreground transition-colors hover:text-foreground"
          >
            Agents
          </Link>
        </div>
      </nav>
      <div className="ml-auto flex items-center gap-4 md:ml-auto md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Toggle user menu"
              className="flex gap-2 h-auto px-1 md:pl-3 py-1"
            >
              <span className="flex-col text-end items-end gap-1 hidden md:flex">
                <span className="font-normal leading-none">{name}</span>
                <span className="font-normal leading-none text-xs text-muted-foreground max-w-36 text-ellipsis text-nowrap overflow-hidden">
                  {tenant}
                </span>
              </span>
              <Avatar className="md:h-10 md:w-10 h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
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
            <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
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

export default AppTopBar;