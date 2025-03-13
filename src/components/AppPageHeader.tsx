import React, { useRef, useEffect } from 'react';
import { useLayout } from '@/context/LayoutContext';

interface AppPageHeaderProps {
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
}

const AppPageHeader: React.FC<AppPageHeaderProps> = ({ title, description, children }) => {
  const { setHeaderSlotElement } = useLayout();
  const headerSlotPortalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerSlotPortalRef.current) {
      setHeaderSlotElement(headerSlotPortalRef.current);
    }

    return () => {
      setHeaderSlotElement(null);
    };
  }, [setHeaderSlotElement]);

  return (
    <header ref={headerSlotPortalRef} className="mb-6 flex justify-between flex-wrap gap-2">
      <div className="flex-1 basis-80">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </header>
  );
};

export default AppPageHeader;