import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { useFeatureFlag } from '@/context/FeatureFlagContext';

/**
 * Controls how mock data is handled in the Audit feature
 *
 * - 'hooks': Use each hook's individual mock parameter (defaults to true if not provided)
 * - 'mock': Force all hooks to use mock data, regardless of their individual settings
 * - 'api': Force all hooks to use real API calls, regardless of their individual settings
 */
export type MockSource = 'hooks' | 'mock' | 'api';

/**
 * Defines the shape of the Audit Mock Context.
 */
interface AuditMockContextType {
  /** The current source ('hooks', 'mock', 'api') controlling mock behavior. */
  mockSource: MockSource;
  /** Function to update the mock source. */
  setMockSource: (source: MockSource) => void;
}

const AUDIT_MOCK_SOURCE_KEY = 'auditMockSource';

/**
 * Retrieves the initial MockSource value.
 * It prioritizes the value stored in sessionStorage if the 'auditMockToggle' feature
 * flag is enabled. Otherwise, or if no valid value is stored, it defaults to 'hooks'.
 * @returns The initial MockSource state.
 */
const getInitialMockSource = (): MockSource => {
  const storedValue = sessionStorage.getItem(AUDIT_MOCK_SOURCE_KEY);
  if (storedValue === 'api' || storedValue === 'mock' || storedValue === 'hooks') {
    return storedValue as MockSource;
  }
  return 'hooks';
};

/**
 * React Context for managing the mock data source preference for Audit features.
 */
const AuditMockContext = createContext<AuditMockContextType>({
  mockSource: getInitialMockSource(),
  setMockSource: () => {}
});

/**
 * Provider component for the AuditMockContext.
 * Manages the mock source state and synchronizes it with sessionStorage
 * when the 'auditMockToggle' feature flag is enabled.
 * It also handles cleanup and potential page refreshes when the flag or source changes.
 * @param children - The child components to wrap with the provider.
 */
export function AuditMockProvider({ children }: { children: ReactNode }) {
  const [mockSource, setMockSourceInternal] = useState<MockSource>(getInitialMockSource);
  const isToggleFlagEnabled = useFeatureFlag('auditMockToggle');

  useAuditMockCleanupEffect(isToggleFlagEnabled, mockSource, setMockSourceInternal);
  useAuditMockRefreshEffect(isToggleFlagEnabled, mockSource);

  const setMockSource = (source: MockSource) => {
    setMockSourceInternal(source);

    if (isToggleFlagEnabled) {
      sessionStorage.setItem(AUDIT_MOCK_SOURCE_KEY, source);
    }
    // The refresh useEffect will handle reloads based on state change.
  };

  return (
    <AuditMockContext.Provider value={{ mockSource, setMockSource }}>
      {children}
    </AuditMockContext.Provider>
  );
}

/**
 * Hook to access and control the Audit feature's mock data source.
 * Provides the current mock source, whether mocking is effectively enabled
 * based on the source and default preference, and a function to change the source.
 * @param defaultMock - If true (default), the hook will indicate mocking is enabled
 *                      when the global mockSource is 'hooks'. If false, it will indicate
 *                      mocking is disabled when the source is 'hooks'.
 * @returns An object containing:
 *          - mockSource: The current global setting ('hooks', 'mock', 'api').
 *          - isMocked: Boolean indicating if mocking should be active for this specific usage.
 *          - setMockSource: Function to change the global mock source setting.
 */
export const useAuditMock = (defaultMock: boolean = true) => {
  const { mockSource } = useContext(AuditMockContext);
  const isMocked = mockSource === 'hooks' ? defaultMock : mockSource === 'mock';

  return {
    mockSource,
    isMocked,
    setMockSource: useContext(AuditMockContext).setMockSource
  };
};

// --- Custom Hooks for Effects ---

/**
 * Effect hook to handle cleanup when the mock toggle feature is disabled.
 * Resets the mock source to the default ('hooks') and clears session storage.
 */
const useAuditMockCleanupEffect = (
  isToggleFlagEnabled: boolean,
  mockSource: MockSource,
  setMockSourceInternal: React.Dispatch<React.SetStateAction<MockSource>>
) => {
  useEffect(() => {
    if (!isToggleFlagEnabled) {
      if (mockSource !== 'hooks') {
        setMockSourceInternal('hooks');
      }
      sessionStorage.removeItem(AUDIT_MOCK_SOURCE_KEY);
    }
  }, [isToggleFlagEnabled, mockSource, setMockSourceInternal]);
};

/**
 * Effect hook to handle page refresh when the mock toggle availability or
 * the selected mock source changes, ensuring a consistent application state.
 */
const useAuditMockRefreshEffect = (
  isToggleFlagEnabled: boolean,
  mockSource: MockSource
) => {
  const previousStateRef = useRef<{ flag: boolean | undefined, source: MockSource | undefined }>({ flag: undefined, source: undefined });

  useEffect(() => {
    const previousFlag = previousStateRef.current.flag;
    const previousSource = previousStateRef.current.source;
    // Why refresh? Toggling mocks/flags requires a full state reset to avoid
    // inconsistencies (e.g., stale data). Reload ensures a clean start.
    if (previousStateRef.current.flag !== undefined &&
        (previousFlag !== isToggleFlagEnabled || previousSource !== mockSource)
    ) {
      // Small delay for potential URL updates before reload
      setTimeout(() => window.location.reload(), 100);
    }

    previousStateRef.current = { flag: isToggleFlagEnabled, source: mockSource };
  }, [isToggleFlagEnabled, mockSource]);
};
