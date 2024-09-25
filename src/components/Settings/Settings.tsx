import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import AppearanceSettings from './AppearanceSettings';

const Settings: React.FC = () => {
  return (
    <Tabs defaultValue="profile">
      <TabsList className='mb-6'>
        <TabsTrigger value="profile">My Profile</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="organization">
        <OrganizationSettings />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  );
};

export default Settings;