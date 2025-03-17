import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  isPageLoading: boolean;
  isDialogLoading: boolean;
  setPageLoading: (isLoading: boolean) => void;
  setDialogLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingState | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);

  const setPageLoading = (isLoading: boolean) => {
    setIsPageLoading(isLoading);
  };

  const setDialogLoading = (isLoading: boolean) => {
    setIsDialogLoading(isLoading);
  };

  return (
    <LoadingContext.Provider
      value={{
        isPageLoading,
        isDialogLoading,
        setPageLoading,
        setDialogLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingState => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
