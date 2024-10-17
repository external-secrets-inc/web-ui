import React from 'react';

interface AppPageHeaderProps {
  title: string;
  description: React.ReactNode;
}

const AppPageHeader: React.FC<AppPageHeaderProps> = ({ title, description }) => {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </header>
  );
};

export default AppPageHeader;