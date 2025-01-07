import { createContext, useContext, useEffect } from 'react';
import useGetSubscriptions from "@/services/subscriptions/queries/useGetSubscriptions";
import { Subscription } from '@/types';

interface SubscriptionContextValue {
  subscriptions: Subscription[] | undefined;
  isLoading: boolean;
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
  } = useGetSubscriptions();

  useEffect(() => {
    if (!isError) return;
    console.error('Failed to load subscription information:', error);
  }, [error, isError]);

  const value: SubscriptionContextValue = {
    subscriptions,
    isLoading,
    // TODO: Temporary solution to check if the user has access to a given named feature. Tenant Manager should be responsible for this, not the client. #172
    hasFeature: (featureName: string) => {
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