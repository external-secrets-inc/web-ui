import { useEffect, useState } from 'react';
import BGAuthHero from "@/assets/bg-auth-hero.jpg";
import BGNoise from "@/assets/bg-noise.png";
import logoESIFullWhite from "@/assets/logo-esi-full-white.svg";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { Button } from "@/components/ui/button";
import { LucideArrowLeft } from "lucide-react";

interface AuthProps {
  variant: 'login' | 'signup';
}

function Auth({ variant }: AuthProps) {
  const [tenantId, setTenantId] = useState('');
  const [currentStep, setCurrentStep] = useState<"organizationURL" | "credentials">("organizationURL");

  useEffect(() => {
    setCurrentStep("organizationURL");
    setTenantId('');
  }, [variant]);

  const handleStepChange = (step: "organizationURL" | "credentials") => {
    setCurrentStep(step);
  };

  const handleOrganizationURLChange = (tenantId: string) => {
    setTenantId(tenantId);
  };

  return (
    <div className="p-2 lg:p-14 xl:p-20 min-h-dvh flex flex-col">
      <div className="z-10 w-full flex-1 flex flex-col max-w-[1600px] mx-auto lg:grid lg:grid-cols-[minmax(30%,60%)_minmax(auto,auto)] rounded-[32px] overflow-hidden backdrop-brightness-[2.75] dark:backdrop-brightness-75 dark:backdrop-contrast-200 bg-background/50 dark:bg-background/90">
        <div className="relative contain-content p-8 py-6 sm:py-8 lg:p-20 flex flex-col flex-0 gap-6 items-start justify-between rounded-[inherit]">
          <a
            href="https://externalsecrets.com"
            className="self-center sm:self-start"
            tabIndex={-1}
          >
            <img
              className="h-7 sm:h-10 lg:h-12 w-auto"
              src={logoESIFullWhite}
              alt="External Secrets"
            />
          </a>
          <h1 className="hidden sm:block text-base sm:text-xl font-bold text-white lg:text-3xl xl:text-5xl lg:max-w-[310px] xl:max-w-[480px]">
            Your seamless secrets management journey starts here
          </h1>
          <div
            className="absolute inset-0 bg-[100%_auto] bg-center animate-bg-auth-hero-scroll motion-reduce:animate-none -z-10 border-transparent border-8 bg-clip-padding rounded-[inherit] opacity-95 dark:opacity-75"
            style={{ backgroundImage: `url('${BGAuthHero}')` }}
          />
        </div>
        <div className="flex flex-col gap-6 items-center justify-between p-8 pb-12 lg:p-14 flex-1">
          <div className="m-auto grid max-w-full w-[352px] gap-8">
            {variant === 'login' && (
              <section
                className="grid gap-6"
                aria-label="Log in to an Organization"
              >
                <header className="grid gap-1">
                  <h1 className="text-lg sm:text-3xl font-bold">
                    {currentStep === "credentials" && tenantId ? (
                      <>You're logging in on</>
                    ) : (
                      <>Log in to an Organization</>
                    )}
                  </h1>
                  {currentStep === "credentials" && tenantId ? (
                    <h2 className="text-pretty text-sm text-muted-foreground">
                      app.externalsecrets.com/<strong className='text-foreground'>{tenantId}</strong>
                    </h2>
                  ) : (
                    <h2 className="text-sm sm:text-base text-pretty text-muted-foreground">
                      Welcome back!
                    </h2>
                  )}
                </header>

                <LoginForm onStepChange={handleStepChange} onOrganizationURLChange={handleOrganizationURLChange} />
              </section>
            )}

            {variant === 'signup' && (
              <section
                className="grid gap-6"
                aria-label="Create an Organization"
              >
                <header className="grid gap-1">
                  <h1 className="text-lg sm:text-3xl font-bold">Create an Organization</h1>
                  <h2 className="text-sm sm:text-base text-pretty text-muted-foreground">
                    Let's get started into your managed ESO experience
                  </h2>
                </header>

                <SignupForm />
              </section>
            )}

            <Button
              variant="link"
              size="inline"
              className="text-foreground justify-self-start"
              asChild
            >
              <a href="https://externalsecrets.com">
                <LucideArrowLeft className="mr-2" /> Home
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-tl from-violet-400/60 to-violet-950">
        <div className="absolute inset-0 blur-[250px] translate-z-0">
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-violet-400 mix-blend-lighten rounded-full translate-x-[-30%] translate-y-[40%] animate-bg-auth-blob-animation-1 motion-reduce:animate-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-200 rounded-full translate-x-[20%] translate-y-[-40%] animate-bg-auth-blob-animation-2 motion-reduce:animate-none" />
        </div>
        <div
          className="absolute inset-0 bg-[length:150px] mix-blend-overlay"
          style={{ backgroundImage: `url('${BGNoise}')` }}
        />
      </div>
    </div>
  );
}

export default Auth;