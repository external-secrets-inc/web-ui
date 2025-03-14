import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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

const RefreshDataButton = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const isFetchingAuditData = useIsFetching({ queryKey: ['audit'] }) > 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['audit'],
      refetchType: 'active',
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleRefresh}
      disabled={isFetchingAuditData}
    >
      {isFetchingAuditData ? (
        <Loader />
      ) : (
        <LucideRefreshCw />
      )}
      {children}
    </Button>
  );
};

const AuditWrapper = () => {
  const { hasFeature, isLoading: isLoadingSubscriptions } = useSubscription();
  const hasAccess = hasFeature('Listener Component');

  const {
    isReady,
    isLoading: isLoadingSetup,
    error: setupError,
    tenantListener,
    auditListener
  } = useAuditSetup();

  if (isLoadingSubscriptions || isLoadingSetup) {
    return <Loader size="lg" className="flex-1 self-center" />;
  }

  // Show premium feature alert if user doesn't have access
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

  // Show setup error if something went wrong
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
          <AlertDescription className="flex items-center justify-between">
            Please retry or contact support if the issue persists
          </AlertDescription>
        </div>
        <RefreshDataButton>Retry Setup</RefreshDataButton>
      </Alert>
    );
  }

  // Only render Audit component when setup is ready
  if (!isReady) {
    return <Loader size="lg" className="flex-1 self-center" />;
  }

  return (
    <AuditMockProvider>
      <div className="space-y-4">
        <AppPageHeaderPortal>
          <RefreshDataButton>Refresh Data</RefreshDataButton>
        </AppPageHeaderPortal>
        <AuditFilterProvider>
          <Audit
            tenantListener={tenantListener!}
            auditListener={auditListener!}
          />
        </AuditFilterProvider>
      </div>
    </AuditMockProvider>
  );
};

export default AuditWrapper;
