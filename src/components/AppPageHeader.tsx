import React from 'react';

interface AppPageHeaderProps {
  title: string;
  description: string;
}

const AppPageHeader: React.FC<AppPageHeaderProps> = ({ title, description }) => {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="text-muted-foreground">{description}</div>
    </header>
  );
};

export default AppPageHeader;