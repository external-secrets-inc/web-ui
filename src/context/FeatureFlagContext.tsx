import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export type FeatureFlagName = 'lineage' | 'mobileTabs';

/**
 * List of all available feature flags in the application.
 * Add new flags here to make them available for toggling.
 */
export const AVAILABLE_FEATURE_FLAGS: FeatureFlagName[] = ['lineage', 'mobileTabs'];

/**
 * Parses the VITE_ENABLED_FEATURE_FLAGS environment variable to get flags that are
 * enabled by default and cannot be disabled through the UI/Query Params.
 * Format: comma-separated list of flag names (e.g., "flag1,flag2,flag3")
 */
const getEnabledFeatureFlagsFromEnv = (): Set<string> => {
  const features = import.meta.env.VITE_ENABLED_FEATURE_FLAGS?.split(',').map((f: string) => f.trim()) || [];
  return new Set(features);
};

/** Cache env flags to avoid recalculating on every check */
const envFlags = getEnabledFeatureFlagsFromEnv();

/**
 * Extracts feature flags from URL search parameters.
 * Features are stored in the 'features' parameter as a comma-separated list.
 */
const getFeaturesFromParams = (search: string): Set<string> => {
  const params = new URLSearchParams(search);
  const features = params.get('features')?.split(',').filter(Boolean) || [];
  return new Set(features);
};

/**
 * Helper to compare two sets.
 */
const areSetsEqual = (a: Set<string>, b: Set<string>): boolean => {
  if (a.size !== b.size) return false;
  return Array.from(a).every(value => b.has(value));
};

/**
 * Feature Flag Context interface defining the available methods for managing feature flags.
 */
export interface FeatureFlagContextValue {
  /**
   * Checks if a feature flag is currently enabled.
   * A flag can be enabled either through URL parameters or environment variables.
   * @param feature - The feature flag to check
   */
  hasFeatureFlagEnabled: (feature: FeatureFlagName) => boolean;

  /**
   * Enables a feature flag by adding it to the URL parameters.
   * Has no effect if the flag is already enabled or is enabled by environment variables.
   */
  enableFeatureFlag: (feature: FeatureFlagName) => void;

  /**
   * Disables a feature flag by removing it from the URL parameters.
   * Has no effect if the flag is enabled by environment variables.
   */
  disableFeatureFlag: (feature: FeatureFlagName) => void;

  /**
   * List of all available feature flags that can be toggled.
   */
  availableFlags: FeatureFlagName[];

  /**
   * Checks if a feature flag is enabled by environment variable.
   * Environment-enabled flags cannot be disabled through the UI.
   */
  isEnabledByEnv: (feature: FeatureFlagName) => boolean;
}

/**
 * React Context for the feature flag system.
 * Provides methods to check and manipulate feature flags across the application.
 */
export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

/**
 * Hook to easily check if a specific feature flag is enabled.
 * Use this to conditionally render components and logic based on feature flags.
 */
export const useFeatureFlag = (feature: FeatureFlagName): boolean => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within FeatureFlagProvider');
  }
  return context.hasFeatureFlagEnabled(feature);
};

/**
 * Hook to access the complete feature flag context.
 * Provides access to all feature flag management functions.
 * @returns The feature flag context value
 * @throws Error if used outside of FeatureFlagProvider
 */
export const useFeatureFlagContext = (): FeatureFlagContextValue => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within FeatureFlagProvider');
  }
  return context;
};

/**
 * Provider component for the feature flag system.
 * Manages feature flag state and synchronization with URL parameters.
 *
 * Features can be enabled in two ways:
 * 1. Through environment variables (VITE_ENABLED_FEATURE_FLAGS)
 * 2. Through URL parameters (?features=flag1,flag2)
 *
 * Environment-enabled flags take precedence and cannot be disabled through the UI.
 */
export const FeatureFlagProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const [urlFeatureFlags, setUrlFeatureFlags] = useState<Set<string>>(() => (
    getFeaturesFromParams(location.search)
  ));

  const isEnabledByEnv = useCallback((feature: FeatureFlagName): boolean => (
    envFlags.has(feature)
  ), []);

  // Sync URL flags with our state
  useEffect(() => {
    const currentFlags = getFeaturesFromParams(location.search);

    // Only update if flags are different
    if (!areSetsEqual(currentFlags, urlFeatureFlags)) {
      if (urlFeatureFlags.size > 0 && currentFlags.size === 0) {
        // Restore flags if they were lost
        const newParams = new URLSearchParams(location.search);
        newParams.set('features', Array.from(urlFeatureFlags).join(','));
        setSearchParams(newParams, { replace: true });
      } else {
        // Update our state to match URL
        setUrlFeatureFlags(currentFlags);
      }
    }
  }, [location.search, setSearchParams, urlFeatureFlags]);

  const updateUrlFeatureFlags = useCallback((features: Set<string>) => {
    // Don't update if flags haven't changed
    if (areSetsEqual(features, urlFeatureFlags)) return;

    const newParams = new URLSearchParams(location.search);
    if (features.size > 0) {
      newParams.set('features', Array.from(features).join(','));
    } else {
      newParams.delete('features');
    }
    setSearchParams(newParams, { replace: true });
  }, [location.search, setSearchParams, urlFeatureFlags]);

  const hasFeatureFlagEnabled = useCallback((feature: FeatureFlagName): boolean => (
    urlFeatureFlags.has(feature) || envFlags.has(feature)
  ), [urlFeatureFlags]);

  const enableFeatureFlag = useCallback((feature: FeatureFlagName) => {
    setUrlFeatureFlags(prev => {
      if (prev.has(feature)) return prev; // No change needed
      const next = new Set(prev).add(feature);
      updateUrlFeatureFlags(next);
      return next;
    });
  }, [updateUrlFeatureFlags]);

  const disableFeatureFlag = useCallback((feature: FeatureFlagName) => {
    setUrlFeatureFlags(prev => {
      if (!prev.has(feature)) return prev; // No change needed
      const next = new Set(prev);
      next.delete(feature);
      updateUrlFeatureFlags(next);
      return next;
    });
  }, [updateUrlFeatureFlags]);

  return (
    <FeatureFlagContext.Provider value={{
      hasFeatureFlagEnabled,
      enableFeatureFlag,
      disableFeatureFlag,
      availableFlags: AVAILABLE_FEATURE_FLAGS,
      isEnabledByEnv,
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};