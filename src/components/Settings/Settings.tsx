import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import AppearanceSettings from './AppearanceSettings';
import SubscriptionSettings from './SubscriptionsSettings';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const Settings: React.FC = () => {
  const handleTabChange = (value: string) => {
    analytics.track('Settings Tab Changed', {
      tab: value,
    });
  };

  return (
    <Tabs defaultValue="profile" onValueChange={handleTabChange}>
      <ScrollArea className="mb-3 pb-3">
        <TabsList>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <ScrollBar orientation='horizontal'/>
      </ScrollArea>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="organization">
        <OrganizationSettings />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>
      <TabsContent value="subscriptions">
        <SubscriptionSettings />
      </TabsContent>
    </Tabs>
  );
};

export default Settings;