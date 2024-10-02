import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { LucideMenu } from 'lucide-react';
import React, { ReactNode } from 'react';

interface SideNavMenuProps {
  children: ReactNode;
}

const SideNavMenu: React.FC<SideNavMenuProps> = ({ children }) => {
  return (
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
        <VisuallyHidden.Root>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription />
        </VisuallyHidden.Root>
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideNavMenu;