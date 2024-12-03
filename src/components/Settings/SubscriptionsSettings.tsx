import React, { useEffect, useState } from 'react';
import { getSubscriptions } from '@/services/subscriptions/subscriptionsService';
import { Subscription } from '@/types';
import { toast } from 'sonner';
import { LucideCircleAlert } from 'lucide-react';

const SubscriptionSettings: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsData = await getSubscriptions();
        setSubscriptions(subscriptionsData);
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars

        toast.error('Failed to load subscriptions');
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div>
      <h2 className='text-sm font-semibold'>Subscriptions</h2>
      <h3 className='text-sm text-muted-foreground mb-6'>
        Manage your subscription information
      </h3>

      <div className="space-y-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => {

            const formattedExpiryDate = new Date(subscription.expiryDate).toLocaleDateString();
            const hasExpiredSubscription = new Date(subscription.expiryDate) <= new Date();

            return (
              <div
                key={subscription.id}
                className="p-4 border border-muted rounded-md"
              >
                <h4 className="text-md font-bold">{subscription.name}</h4>
                <p>Max Limit: {subscription.maxLimit}</p>
                <p className="flex items-center">
                  Expiry Date: {formattedExpiryDate}
                  {hasExpiredSubscription && (
                    <span className="text-red-500 ml-2 flex items-center">
                      <LucideCircleAlert className="mr-1" />
                      <span>Expired</span>
                    </span>
                  )}
                </p>
                <p>Features:</p>
                <ul>
                  {subscription.features.length > 0 ? (
                    subscription.features.map((feature, idx) => (
                      <li key={idx}>
                        <strong>{feature.name}</strong>: {feature.description}
                      </li>
                    ))
                  ) : (
                    <li>No features available</li>
                  )}
                </ul>
              </div>
            );
          })
        ) : (
          <p>No subscriptions available.</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSettings;
