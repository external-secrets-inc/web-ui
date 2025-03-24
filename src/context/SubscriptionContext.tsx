import { createContext, useContext, useEffect } from 'react';
import useGetSubscriptions from "@/services/subscriptions/queries/useGetSubscriptions";
import { Subscription } from '@/types';
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants';

interface SubscriptionContextValue {
  subscriptions: Subscription[] | undefined;
  isLoading: boolean;
  error: Error | null;
  hasFeature: (featureName: string) => boolean;
  getExpiryDate: () => string | undefined;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const {
    data: subscriptions,
    isLoading,
    error,
    isError
  } = useGetSubscriptions({
    staleTime: ONE_SECOND_IN_MILLISECONDS * 60 * 60 * 24, // 24 hours
  });

  useEffect(() => {
    if (!isError) return;
    console.error('Failed to load subscription information:', error);
  }, [error, isError]);

  const value: SubscriptionContextValue = {
    subscriptions,
    isLoading,
    error: isError ? error : null,
    // TODO: Temporary solution to check if the user has access to a given named feature. Tenant Manager should be responsible for this, not the client. #172
    hasFeature: (featureName: string) => {
      if (error) return false;
      return subscriptions?.some(subscription =>
        subscription.features.some(feature => feature.name === featureName)
      ) ?? false;
    },
    getExpiryDate: () => subscriptions?.[0]?.expiryDate
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === null) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}