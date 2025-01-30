import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export type FeatureFlagName = 'lineage';

/**
 * List of all available feature flags in the application.
 * Add new flags here to make them available for toggling.
 */
export const AVAILABLE_FEATURE_FLAGS: FeatureFlagName[] = ['lineage'];

/**
 * Parses the VITE_FEATURE_FLAGS environment variable to get flags that are
 * explicitly set to true or false.
 * Format: flag1:true,flag2:false
 * Example: VITE_FEATURE_FLAGS=lineage:true,someOtherFeature:false
 */
const getFeatureFlagsFromEnv = (): Record<string, boolean> => {
  const flagString = import.meta.env.VITE_FEATURE_FLAGS;
  if (!flagString) return {};

  return flagString.split(',').reduce((acc: Record<string, boolean>, pair: string) => {
    const [key, value] = pair.trim().split(':');
    if (key && value) {
      // Support both true/false and on/off syntax
      acc[key.trim()] = value.trim().toLowerCase() === 'true' || value.trim().toLowerCase() === 'on';
    }
    return acc;
  }, {});
};

/** Cache env flags to avoid recalculating on every check */
const envFlags = getFeatureFlagsFromEnv();

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
   * Priority:
   * 1. Environment override (if set to true or false)
   * 2. URL parameters (if no environment override)
   */
  hasFeatureFlagEnabled: (feature: FeatureFlagName) => boolean;

  /**
   * Enables a feature flag by adding it to the URL parameters.
   * Has no effect if the flag is locked by environment variables.
   */
  enableFeatureFlag: (feature: FeatureFlagName) => void;

  /**
   * Disables a feature flag by removing it from the URL parameters.
   * Has no effect if the flag is locked by environment variables.
   */
  disableFeatureFlag: (feature: FeatureFlagName) => void;

  /**
   * List of all available feature flags that can be toggled.
   */
  availableFlags: FeatureFlagName[];

  /**
   * Checks if a feature flag is locked by environment variable.
   * Returns true if the flag has an explicit true/false value in env vars.
   */
  isLockedByEnv: (feature: FeatureFlagName) => boolean;

  /**
   * Gets the environment override value for a feature flag.
   * Returns undefined if the flag is not overridden by environment.
   */
  getEnvOverride: (feature: FeatureFlagName) => boolean | undefined;
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
 * 1. Through environment variables (VITE_FEATURE_FLAGS)
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

  const isLockedByEnv = useCallback((feature: FeatureFlagName): boolean => (
    envFlags[feature] !== undefined
  ), []);

  const getEnvOverride = useCallback((feature: FeatureFlagName): boolean | undefined => (
    envFlags[feature]
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

  const hasFeatureFlagEnabled = useCallback((feature: FeatureFlagName): boolean => {
    // Environment override takes precedence if set
    const envValue = envFlags[feature];
    if (envValue !== undefined) return envValue;

    // Otherwise use URL params
    return urlFeatureFlags.has(feature);
  }, [urlFeatureFlags]);

  const enableFeatureFlag = useCallback((feature: FeatureFlagName) => {
    // Don't modify if locked by environment
    if (isLockedByEnv(feature)) return;

    setUrlFeatureFlags(prev => {
      if (prev.has(feature)) return prev; // No change needed
      const next = new Set(prev).add(feature);
      updateUrlFeatureFlags(next);
      return next;
    });
  }, [isLockedByEnv, updateUrlFeatureFlags]);

  const disableFeatureFlag = useCallback((feature: FeatureFlagName) => {
    // Don't modify if locked by environment
    if (isLockedByEnv(feature)) return;

    setUrlFeatureFlags(prev => {
      if (!prev.has(feature)) return prev; // No change needed
      const next = new Set(prev);
      next.delete(feature);
      updateUrlFeatureFlags(next);
      return next;
    });
  }, [isLockedByEnv, updateUrlFeatureFlags]);

  return (
    <FeatureFlagContext.Provider value={{
      hasFeatureFlagEnabled,
      enableFeatureFlag,
      disableFeatureFlag,
      availableFlags: AVAILABLE_FEATURE_FLAGS,
      isLockedByEnv,
      getEnvOverride,
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};