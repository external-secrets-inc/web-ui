import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  LucideChevronDown,
  LucideLock,
  LucideToggleLeft,
  LucideToggleRight,
} from "lucide-react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

export function LayoutSidebarUserMenu() {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Toggle user menu"
          className="flex gap-2 h-auto px-1 md:pr-3 py-1 justify-start"
        >
          <Avatar className="md:h-10 md:w-10 h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <span className="flex-col items-start gap-1 hidden md:flex">
            <span className="inline-flex gap-1">
              <span className="font-normal leading-none max-w-36 text-ellipsis text-nowrap overflow-hidden">
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

        {showFeatureFlags && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Feature Flags</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {featureFlags.toggleableFlags.map((flag) => {
                  const isEnabled = featureFlags.hasFeatureFlagEnabled(flag);
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
                        <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This flag is {envValue ? "enabled" : "disabled"} by
                            the environment and cannot be changed
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return menuItem;
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => signOut({ reason: "manual" })}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getInitials(name: string | undefined): string {
  if (!name) return "";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, 2);
}
