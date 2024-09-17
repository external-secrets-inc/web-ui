import LogoEsiFullWhite from "@/assets/logo-esi-full-white.svg?react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IUserData } from "@/types";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { Link, Outlet } from 'react-router-dom';
import { Avatar, AvatarFallback } from "./components/ui/avatar";

const App = () => {
  const authUser = useAuthUser<IUserData>();
  const tenant = authUser?.tenant;

  return (
    <div className="app-layout">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="font-medium flex flex-row items-center gap-8 text-sm">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <LogoEsiFullWhite className="h-9"/>
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
        <div className="ml-auto flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-label="Toggle user menu"
                className="flex gap-2 h-auto pr-1 pl-3 py-1"
              >
                <span className="flex flex-col text-end items-end gap-1">
                  <span className="font-normal leading-none">
                    John Doe
                  </span>
                  <span className="font-normal leading-none text-xs text-muted-foreground max-w-36 text-ellipsis overflow-hidden">
                    External Secrets Operator
                  </span>
                </span>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;