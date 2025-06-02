import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IS_DEV } from "@/constants";
import {
  FeatureFlagName,
  useFeatureFlagContext,
} from "@/context/FeatureFlagContext";
import { useSignOut } from "@/hooks/useSignOut";
import { IUserData } from "@/types";
import {
  LogOut,
  LucideChevronsUpDown,
  LucideLandPlot,
  LucideLock,
  LucideToggleLeft,
  LucideToggleRight,
} from "lucide-react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export function LayoutSidebarUserMenu() {
  const { isMobile } = useSidebar();
  const authUser = useAuthUser<IUserData>();
  const signOut = useSignOut();
  const tenant = authUser?.tenant;
  const name = authUser?.name;
  const initials = getInitials(name);
  const featureFlags = useFeatureFlagContext();

  const showFeatureFlags = IS_DEV;

  const toggleFeatureFlag = (flag: FeatureFlagName) => {
    if (featureFlags.isLockedByEnv(flag)) return;

    if (featureFlags.hasFeatureFlagEnabled(flag)) {
      featureFlags.disableFeatureFlag(flag);
    } else {
      featureFlags.enableFeatureFlag(flag);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-sm ring-inset ring-1 ring-sidebar-foreground/50">
                <AvatarFallback className="rounded-sm bg-primary-400/50 dark:bg-primary-300/80 text-primary-900/70 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{tenant}</span>
              </div>
              <LucideChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-sm ring-inset ring-1 ring-sidebar-foreground/50">
                <AvatarFallback className="rounded-sm bg-primary-400/50 dark:bg-primary-300/80 text-primary-900/70 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{tenant}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {showFeatureFlags && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <LucideLandPlot className="mr-2" />
                      Feature Flags
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {featureFlags.toggleableFlags.map((flag) => {
                        const isEnabled =
                          featureFlags.hasFeatureFlagEnabled(flag);
                        const isLocked = featureFlags.isLockedByEnv(flag);
                        const envValue = featureFlags.getEnvOverride(flag);

                        const menuItem = (
                          <DropdownMenuItem
                            key={flag}
                            onClick={() => toggleFeatureFlag(flag)}
                            disabled={isLocked}
                            className={
                              isLocked
                                ? "opacity-50 cursor-not-allowed !pointer-events-auto"
                                : ""
                            }
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
                                <p>
                                  This flag is{" "}
                                  {envValue ? "enabled" : "disabled"} by the
                                  environment and cannot be changed
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return menuItem;
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={() => signOut({ reason: "manual" })}>
              <LogOut className="mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getInitials(name: string | undefined): string {
  if (!name) return "";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, 2);
}
