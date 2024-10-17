import React from 'react';
import SignupForm from './SignupForm';

const AuthSignupSection: React.FC = () => (
  <section className="grid gap-6" aria-label="Create an Organization">
    <header className="grid gap-1">
      <h1 className="text-lg sm:text-3xl font-bold">Create an Organization</h1>
      <h2 className="text-sm sm:text-base text-pretty text-muted-foreground">
        Unlock the full potential of External Secrets in your Kubernetes cluster
      </h2>
    </header>

    <SignupForm />
  </section>
);

export default AuthSignupSection;