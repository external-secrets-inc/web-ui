import { trackSignedOut } from "@/analytics";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IS_DEV } from '@/constants';
import { FeatureFlagName, useFeatureFlagContext } from '@/context/FeatureFlagContext';
import useOrgLink from '@/hooks/useOrgLink';
import { IUserData } from '@/types';
import { LucideChevronDown, LucideLock, LucideToggleLeft, LucideToggleRight } from 'lucide-react';
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
  const featureFlags = useFeatureFlagContext();

  const showFeatureFlags = IS_DEV;

  const handleSignOut = () => {
    signOut();
    trackSignedOut(true);
    navigate('/login');
  };

  const toggleFeatureFlag = (flag: FeatureFlagName) => {
    if (featureFlags.isLockedByEnv(flag)) return;

    if (featureFlags.hasFeatureFlagEnabled(flag)) {
      featureFlags.disableFeatureFlag(flag);
    } else {
      featureFlags.enableFeatureFlag(flag);
    }
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

        {showFeatureFlags && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Feature Flags</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {featureFlags.availableFlags.map((flag) => {
                  const isEnabled = featureFlags.hasFeatureFlagEnabled(flag);
                  const isLocked = featureFlags.isLockedByEnv(flag);
                  const envValue = featureFlags.getEnvOverride(flag);

                  const menuItem = (
                    <DropdownMenuItem
                      key={flag}
                      onClick={() => toggleFeatureFlag(flag)}
                      disabled={isLocked}
                      className={isLocked ? 'opacity-50 cursor-not-allowed !pointer-events-auto' : ''}
                    >
                      <span className="flex items-center gap-2 w-full">
                        {isEnabled ? (
                          <LucideToggleRight className="text-success" />
                        ) : (
                          <LucideToggleLeft className="text-muted-foreground" />
                        )}
                        {flag}
                        {isLocked && (
                          <LucideLock className="ml-auto text-muted-foreground" />
                        )}
                      </span>
                    </DropdownMenuItem>
                  );

                  if (isLocked) {
                    return (
                      <Tooltip key={flag}>
                        <TooltipTrigger asChild>
                          {menuItem}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This flag is {envValue ? 'enabled' : 'disabled'} by the environment and cannot be changed</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return menuItem;
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

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