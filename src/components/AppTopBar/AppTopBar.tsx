import AppNavLinks from './AppNavLinks';
import React from 'react';
import SideNavMenu from './SideNavMenu';
import UserMenu from './UserMenu';
import AppLogo from '@/components/AppLogo';

const AppTopBar: React.FC = () => {
  return (
    <header className="sticky top-0 flex h-[--topbar-height] border-b bg-background z-20">
      <div className="container flex flex-1 mx-auto items-center gap-6 md:gap-8">
        <nav className="font-medium flex flex-1 flex-row items-center gap-[inherit] text-sm">
          <SideNavMenu>
            <AppNavLinks closeSheetOnClick/>
          </SideNavMenu>

          <AppLogo />

          <div className="hidden md:flex md:flex-1 gap-4">
            <AppNavLinks />
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-auto md:gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;