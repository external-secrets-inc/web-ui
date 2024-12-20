import { useState, useEffect } from 'react';
import { getSubscriptions } from '@/services/subscriptions/subscriptionsService';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Audit from './Audit';
import { Subscription, Feature } from '@/types';
import { LucideGem } from 'lucide-react';

export default function AuditWrapper() {
  const [hasAccess, setHasAccess] = useState(false);

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
      }
    }

    checkFeature();
  }, []);

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

  return <Audit />;
}
