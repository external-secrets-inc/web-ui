import React from 'react';
import { APP_DOMAIN_STRIPPED } from '@/constants';
import LoginForm from './LoginForm';

interface AuthLoginSectionProps {
  currentStep: "organizationURL" | "credentials";
  organizationUrl: string;
  handleStepChange: (step: "organizationURL" | "credentials") => void;
  handleOrganizationURLChange: (organizationUrl: string) => void;
}

const AuthLoginSection: React.FC<AuthLoginSectionProps> = ({ currentStep, organizationUrl, handleStepChange, handleOrganizationURLChange }) => (
  <section className="grid gap-6" aria-label="Log in to an Organization">
    <header className="grid gap-1">
      {currentStep === "credentials" && organizationUrl ?
        <>
          <h1 className="text-lg sm:text-3xl font-bold">
            You're logging in on
          </h1>
          <h2 className="text-pretty text-sm text-muted-foreground">
            {APP_DOMAIN_STRIPPED}/<strong className='text-foreground'>{organizationUrl}</strong>
          </h2>
        </>
        :
        <>
          <h1 className="text-lg sm:text-3xl font-bold">
            Log in to an Organization
          </h1>
          <h2 className="text-sm sm:text-base text-pretty text-muted-foreground">
            Welcome back!
          </h2>
        </>
      }
    </header>
    <LoginForm onStepChange={handleStepChange} onOrganizationURLChange={handleOrganizationURLChange} />
  </section>
);

export default AuthLoginSection;