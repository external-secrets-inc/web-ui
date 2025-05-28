import { useFeatureFlag } from "@/context/FeatureFlagContext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Controls how mock data is handled in the Audit feature
 *
 * - 'hooks': Use each hook's individual mock parameter (defaults to true if not provided)
 * - 'mock': Force all hooks to use mock data, regardless of their individual settings
 * - 'api': Force all hooks to use real API calls, regardless of their individual settings
 */
export type MockSource = "hooks" | "mock" | "api";

/**
 * Defines the shape of the Audit Mock Context.
 */
interface AuditMockContextType {
  /** The current source ('hooks', 'mock', 'api') controlling mock behavior. */
  mockSource: MockSource;
  /** Function to update the mock source. */
  setMockSource: (source: MockSource) => void;
  /** Boolean indicating if the audit mock toggle feature flag is enabled. */
  isAuditMockToggleEnabled: boolean;
}

const AUDIT_MOCK_SOURCE_KEY = "auditMockSource";

/**
 * Retrieves the initial MockSource value.
 * It prioritizes the value stored in sessionStorage.
 * If no valid value is stored, it defaults to 'hooks'.
 * @returns The initial MockSource state.
 */
const getInitialMockSource = (): MockSource => {
  const storedValue = sessionStorage.getItem(AUDIT_MOCK_SOURCE_KEY);
  if (
    storedValue === "api" ||
    storedValue === "mock" ||
    storedValue === "hooks"
  ) {
    return storedValue as MockSource;
  }
  return "hooks"; // Default to "hooks" if nothing valid is stored
};

/**
 * React Context for managing the mock data source preference for Audit features.
 */
const AuditMockContext = createContext<AuditMockContextType | undefined>(
  undefined
);

interface AuditMockProviderProps {
  children?: ReactNode;
}

/**
 * Effect hook to clean up audit mock settings when the feature flag is disabled.
 * If the `auditMockToggle` feature flag is turned off, this effect resets
 * the mock source to "hooks" and removes the stored mock source from session storage.
 *
 * @param isToggleFlagEnabled - Boolean indicating if the audit mock toggle feature flag is enabled.
 * @param mockSource - The current mock source.
 * @param setMockSourceInternal - State setter function for the internal mock source state.
 */
const useAuditMockCleanupEffect = (
  isToggleFlagEnabled: boolean,
  mockSource: MockSource,
  setMockSourceInternal: React.Dispatch<React.SetStateAction<MockSource>>
) => {
  useEffect(() => {
    if (!isToggleFlagEnabled) {
      if (mockSource !== "hooks") {
        setMockSourceInternal("hooks");
      }
      sessionStorage.removeItem(AUDIT_MOCK_SOURCE_KEY);
    }
  }, [isToggleFlagEnabled, mockSource, setMockSourceInternal]);
};

/**
 * Effect hook to trigger a page reload when the audit mock feature flag
 * or the mock source changes. This ensures that components correctly re-initialize
 * with the new settings. A short delay is introduced before reloading.
 *
 * @param isToggleFlagEnabled - Boolean indicating if the audit mock toggle feature flag is enabled.
 * @param mockSource - The current mock source.
 */
const useAuditMockRefreshEffect = (
  isToggleFlagEnabled: boolean,
  mockSource: MockSource
) => {
  const previousStateRef = useRef<{
    flag: boolean | undefined;
    source: MockSource | undefined;
  }>({ flag: undefined, source: undefined });

  useEffect(() => {
    const previousFlag = previousStateRef.current.flag;
    const previousSource = previousStateRef.current.source;

    // Why refresh? Toggling mocks/flags requires a full state reset to avoid
    // inconsistencies (e.g., stale data). Reload ensures a clean start.
    // Only reload if the flag was previously defined (i.e., not the initial render)
    // and either the flag state or the mock source has changed.
    if (
      previousStateRef.current.flag !== undefined && // Ensures it's not the first run
      (previousFlag !== isToggleFlagEnabled || previousSource !== mockSource)
    ) {
      // Adding a small delay to allow React to process state changes before reload
      setTimeout(() => window.location.reload(), 100);
    }

    // Update ref with current values for the next render.
    previousStateRef.current = {
      flag: isToggleFlagEnabled,
      source: mockSource,
    };
  }, [isToggleFlagEnabled, mockSource]);
};

/**
 * Provider component for the AuditMockContext.
 * Manages the mock source state and synchronizes it with sessionStorage
 * when the 'auditMockToggle' feature flag is enabled.
 * It also handles cleanup and potential page refreshes when the flag or source changes.
 * @param children - The child components to wrap with the provider.
 */
export function AuditMockProvider({ children }: AuditMockProviderProps) {
  const [mockSource, setMockSourceInternal] =
    useState<MockSource>(getInitialMockSource);
  const isAuditMockToggleEnabled = useFeatureFlag("auditMockToggle");

  useAuditMockCleanupEffect(
    isAuditMockToggleEnabled,
    mockSource,
    setMockSourceInternal
  );
  useAuditMockRefreshEffect(isAuditMockToggleEnabled, mockSource);

  const setMockSource = (source: MockSource) => {
    setMockSourceInternal(source);
    if (isAuditMockToggleEnabled) {
      sessionStorage.setItem(AUDIT_MOCK_SOURCE_KEY, source);
    } else {
      // If the toggle is disabled, ensure we don't persist to session storage
      // and reset to 'hooks' if it's not already that.
      // The refresh useEffect will handle reloads based on state change.
      sessionStorage.removeItem(AUDIT_MOCK_SOURCE_KEY);
      if (source !== "hooks") {
        setMockSourceInternal("hooks");
      }
    }
  };

  const contextValue: AuditMockContextType = {
    mockSource,
    setMockSource,
    isAuditMockToggleEnabled,
  };

  return (
    <AuditMockContext.Provider value={contextValue}>
      {children}
    </AuditMockContext.Provider>
  );
}

/**
 * Custom hook to access and control the Audit feature's mock data source.
 * Provides the current mock source, whether mocking is effectively enabled
 * based on the source and default preference, and a function to change the source.
 * @param defaultMock - If true (default), the hook will indicate mocking is enabled
 *                      when the global mockSource is 'hooks'. If false, it will indicate
 *                      mocking is disabled when the source is 'hooks'.
 * @returns An object containing:
 *          - mockSource: The current global setting ('hooks', 'mock', 'api').
 *          - isMocked: Boolean indicating if mocking should be active for this specific usage.
 *          - setMockSource: Function to change the global mock source setting.
 *          - isAuditMockToggleEnabled: Boolean indicating if the toggle is currently enabled.
 * @throws Error if used outside of an AuditMockProvider.
 */
export const useAuditMock = (defaultMock: boolean = true) => {
  const context = useContext(AuditMockContext);
  if (context === undefined) {
    throw new Error("useAuditMock must be used within an AuditMockProvider");
  }
  const { mockSource, setMockSource, isAuditMockToggleEnabled } = context;

  // If the toggle is disabled, isMocked should always reflect the 'hooks' state (i.e., defaultMock behavior)
  // because the source effectively becomes 'hooks'.
  const isMocked = !isAuditMockToggleEnabled
    ? defaultMock
    : mockSource === "hooks"
    ? defaultMock
    : mockSource === "mock";

  return {
    mockSource: isAuditMockToggleEnabled ? mockSource : "hooks", // Reflect 'hooks' if toggle is off
    isMocked,
    setMockSource,
    isAuditMockToggleEnabled,
  };
};
