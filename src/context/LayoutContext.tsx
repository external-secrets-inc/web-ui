import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  headerSlotElement: HTMLElement | null;
  setHeaderSlotElement: (el: HTMLElement | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerSlotElement, setHeaderSlotElement] = useState<HTMLElement | null>(null);

  return (
    <LayoutContext.Provider value={{ headerSlotElement, setHeaderSlotElement }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }

  return context;
};