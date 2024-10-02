import LogoEsiFullWhite from '@/assets/logo-esi-full-white.svg?react';
import LogoEsiFull from '@/assets/logo-esi-full.svg?react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useOrgLink from '@/hooks/useOrgLink';
import { IUserData } from '@/types';
import { LucideChevronDown, LucideMenu } from 'lucide-react';
import React from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { Link, useNavigate } from 'react-router-dom';
import AppNavLinks from './AppNavLinks';

const AppTopBar: React.FC = () => {
  const authUser = useAuthUser<IUserData>();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const tenant = authUser?.tenant;
  const name = authUser?.name;
  const initials = getInitials(name);
  const getOrgLink = useOrgLink();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 flex h-12 md:h-16 border-b bg-background z-10">
      <div className="container flex flex-1 mx-auto items-center gap-6 md:gap-8">
        <nav className="font-medium flex flex-1 flex-row items-center gap-[inherit] text-sm">

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open Menu"
              >
                <LucideMenu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left">
              <div className="flex flex-col gap-6">
                <AppNavLinks closeSheetOnClick/>

                <DropdownMenu>
                  <DropdownMenuContent>
                    <DropdownMenuLabel className="md:hidden">
                      <span className="flex-col text-start items-start gap-1 flex">
                        <span className="font-normal leading-none max-w-36 text-ellipsis text-nowrap overflow-hidden">
                          {name}
                        </span>
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
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="mx-auto md:mx-0"
          >
            <LogoEsiFullWhite className="h-7 hidden dark:inline" />
            <LogoEsiFull className="h-7 dark:hidden" />
          </Link>

          <div className="hidden md:flex md:flex-1 gap-4">
            <AppNavLinks />
          </div>

        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-auto md:gap-4">
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
        </div>

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