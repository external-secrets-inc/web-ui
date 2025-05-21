import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideGem, LucideAlertCircle, LucideRefreshCw } from 'lucide-react';
import Audit from './Audit';
import { AuditMockProvider } from '@/services/audit/context/AuditMockContext';
import { AuditFilterProvider } from "./AuditFilterProvider";
import { useSubscription } from "@/context/SubscriptionContext";
import { Loader } from "@/components/ui/Loader";
import useAuditSetup from "@/services/audit/hooks/useAuditSetup";
import { Button } from "@/components/ui/button";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import AppPageHeaderPortal from "@/components/AppPageHeaderPortal";
import { useFeatureFlag } from "@/context/FeatureFlagContext";
import AuditMockToggle from './AuditMockToggle';

interface RefreshButtonProps {
  children: React.ReactNode;
  queryKey: string[];
}

const RefreshButton = ({ children, queryKey }: RefreshButtonProps) => {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey }) > 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey,
      refetchType: 'active',
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleRefresh}
      disabled={isFetching}
      className="flex items-center gap-2"
    >
      {isFetching ? (
        <Loader />
      ) : (
        <LucideRefreshCw className="size-4" />
      )}
      {children}
    </Button>
  );
};

const AuditWrapper = () => {
  const {
    hasFeature,
    isLoading: isLoadingSubscriptions,
    error: subscriptionError
  } = useSubscription();

  const {
    isReady,
    isLoading: isLoadingSetup,
    error: setupError,
    tenantListener,
    auditListener
  } = useAuditSetup();

  const showMockToggle = useFeatureFlag('auditMockToggle');

  if (isLoadingSubscriptions || isLoadingSetup) {
    return <Loader size="lg" className="flex-1 self-center" />;
  }

  // Handle subscription errors first
  if (subscriptionError) {
    return (
      <Alert
        className="flex gap-2 items-center justify-between flex-wrap"
        variant="destructive"
      >
        <div>
          <AlertTitle className="flex gap-3 items-center">
            <LucideAlertCircle className="text-destructive" /> Failed to verify subscription status
          </AlertTitle>
          <AlertDescription>
            Unable to verify your access to this feature. Please try again or contact support if the issue persists.
          </AlertDescription>
        </div>
        <RefreshButton queryKey={['useGetSubscriptions']}>
          Retry
        </RefreshButton>
      </Alert>
    );
  }

  // Then check for feature access
  const hasAccess = hasFeature('Listener Component');
  if (!hasAccess) {
    return (
      <Alert className='border-emerald-500'>
        <AlertTitle className='flex items-center gap-2'>
          <LucideGem className='text-amber-500'/>Premium Feature
        </AlertTitle>
        <AlertDescription>
          <p><strong>Audit</strong> is only available as a premium custom subscription.</p>
          <p>Contact support to learn more about it and get a quote!</p>
        </AlertDescription>
      </Alert>
    );
  }

  // Finally handle setup errors
  if (setupError) {
    return (
      <Alert
        className="flex gap-2 items-center justify-between flex-wrap"
        variant="destructive"
      >
        <div>
          <AlertTitle className="flex gap-3 items-center">
            <LucideAlertCircle className="text-destructive" /> Failed to setup audit listener
          </AlertTitle>
          <AlertDescription>
            Please retry or contact support if the issue persists
          </AlertDescription>
        </div>
        <RefreshButton queryKey={['audit']}>
          Retry Setup
        </RefreshButton>
      </Alert>
    );
  }

  // Only render Audit component when setup is ready
  if (!isReady) {
    return <Loader size="lg" className="flex-1 self-center" />;
  }

  return (
    <AuditMockProvider>
      <AppPageHeaderPortal>
        <div className="flex items-center gap-4">
          {showMockToggle && <AuditMockToggle />}
          <RefreshButton queryKey={['audit']}>
            Refresh Data
          </RefreshButton>
        </div>
      </AppPageHeaderPortal>
      <AuditFilterProvider>
        <Audit
          tenantListener={tenantListener!}
          auditListener={auditListener!}
        />
      </AuditFilterProvider>
    </AuditMockProvider>
  );
};

export default AuditWrapper;
