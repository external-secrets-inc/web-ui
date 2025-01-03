import { useState, useEffect } from 'react';
import { getSubscriptions } from '@/services/subscriptions/subscriptionsService';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Audit from './Audit';
import { Subscription, Feature } from '@/types';
import { LucideGem } from 'lucide-react';
import { AuditMockProvider, useAuditMock } from '@/services/audit/context/AuditMockContext';
import { AuditFilterProvider } from "./AuditFilterProvider";

const MockControls = () => {
  const { mockSource, setMockSource } = useAuditMock();

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium">Data Source:</span>
      <Select
        value={mockSource}
        onValueChange={setMockSource}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hooks">Use Hook Parameter</SelectItem>
          <SelectItem value="mock">Use Mock Data</SelectItem>
          <SelectItem value="api">Use Real API</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const AuditWrapper = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Temporary solution to check if the user has access to the feature. Tenant Manager should be responsible for this, not the client. #172
    async function checkFeature() {
      try {
        const subscriptions = await getSubscriptions();
        const hasFeature = subscriptions.some((subscription: Subscription) =>
          subscription.features.some((feature: Feature) => feature.name === 'Listener Component')
        );
        setHasAccess(hasFeature);
      } catch (error) {
        console.error('Failed to check feature availability:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkFeature();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!hasAccess) {
    return (
      <Alert className='border-emerald-500'>
        <AlertTitle className='flex items-center gap-2'> <LucideGem className='text-amber-500'/>Premium Feature</AlertTitle>
        <AlertDescription>
          <p><strong>Audit</strong> is only available as a premium custom subscription.</p>
          <p>Contact support to learn more about it and get a quote!</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AuditMockProvider>
        <div className="space-y-4">
          <MockControls />
          <AuditFilterProvider>
            <Audit />
          </AuditFilterProvider>
        </div>
    </AuditMockProvider>
  );
};

export default AuditWrapper;
