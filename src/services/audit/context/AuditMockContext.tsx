import { createContext, useContext, ReactNode, useState } from 'react';

/**
 * Controls how mock data is handled in the Audit feature
 *
 * - 'hooks': Use each hook's individual mock parameter (defaults to true if not provided)
 * - 'mock': Force all hooks to use mock data, regardless of their individual settings
 * - 'api': Force all hooks to use real API calls, regardless of their individual settings
 */
export type MockSource = 'hooks' | 'mock' | 'api';

interface AuditMockContextType {
  mockSource: MockSource;
  setMockSource: (source: MockSource) => void;
}

const AuditMockContext = createContext<AuditMockContextType>({
  mockSource: 'mock',
  setMockSource: () => {}
});

export function AuditMockProvider({ children }: { children: ReactNode }) {
  const [mockSource, setMockSource] = useState<MockSource>('mock');

  return (
    <AuditMockContext.Provider value={{ mockSource, setMockSource }}>
      {children}
    </AuditMockContext.Provider>
  );
}

export const useAuditMock = (defaultMock: boolean = true) => {
  const { mockSource } = useContext(AuditMockContext);
  const isMocked = mockSource === 'hooks' ? defaultMock : mockSource === 'mock';

  return {
    mockSource,
    isMocked,
    setMockSource: useContext(AuditMockContext).setMockSource
  };
};
