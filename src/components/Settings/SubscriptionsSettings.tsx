import React, { useEffect, useState } from 'react';
import { getSubscriptions } from '@/services/subscriptions/subscriptionsService';
import { Subscription } from '@/types';
import { toast } from 'sonner';

const SubscriptionSettings: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsData = await getSubscriptions();
        setSubscriptions(subscriptionsData);
      } catch (error) {
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
          subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="p-4 border border-muted rounded-md"
            >
              <h4 className="text-md font-bold">{subscription.name}</h4>
              <p>Max Limit: {subscription.maxLimit}</p>
              <p>Expiry Date: {new Date(subscription.expiryDate).toLocaleDateString()}</p>
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
          ))
        ) : (
          <p>No subscriptions available.</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSettings;