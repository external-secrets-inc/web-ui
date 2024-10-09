import BGAuthHero from "@/assets/bg-auth-hero.jpg";
import BGNoise from "@/assets/bg-noise.png";
import logoESIFullWhite from "@/assets/logo-esi-full-white.svg";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthProps {
  variant: 'login' | 'signup';
}

function Auth({ variant }: AuthProps) {
  return (
    <div className="p-2 lg:p-20 min-h-dvh flex flex-col">
      <div className="z-10 w-full flex-1 flex flex-col max-w-[1600px] mx-auto lg:grid lg:grid-cols-[minmax(30%,60%)_minmax(auto,auto)] rounded-[32px] overflow-hidden backdrop-brightness-[2.75] dark:backdrop-brightness-75 dark:backdrop-contrast-200 bg-background/50 dark:bg-background/90">
        <div className="relative contain-content p-10 lg:p-20 flex flex-col flex-1 gap-10 items-start justify-between rounded-[inherit]">
          <img
            className="max-h-10 lg:max-h-12"
            src={logoESIFullWhite}
            alt="External Secrets"
          />
          <h1 className="text-2xl font-bold text-white lg:text-5xl max-w-[480px]">
            Your seamless secrets management journey starts here
          </h1>
          <div
            className="absolute inset-0 bg-[100%_auto] bg-center animate-bg-auth-hero-scroll motion-reduce:animate-none -z-10 border-transparent border-8 bg-clip-padding rounded-[inherit] opacity-95 dark:opacity-75"
            style={{ backgroundImage: `url('${BGAuthHero}')` }}
          />
        </div>
        <div className="flex items-center justify-center p-10 lg:p-14 flex-1">
          <div className="mx-auto grid w-[352px] gap-6">
            <div className="grid gap-2">
              <h1 className="text-3xl font-bold">{variant === 'login' ? 'Log in to an Organization' : 'Create an Organization'}</h1>
              <p className="text-pretty text-muted-foreground">
                {variant === 'login' ? 'Welcome back! Enter with your Organization credentials' : "Welcome! Let's get started into your managed ESO experience."}
              </p>
            </div>
            {variant === 'login' ? (
              <LoginForm />
            ) : (
              <SignupForm />
            )}
            <div className="mt-4 text-sm">
              {variant === 'login' ? (
                <>
                  Don't have an Organization yet?{" "}
                  <Link to="/signup" className="underline">
                    Sign up for one
                  </Link>
                </>
              ) : (
                <>
                  Already a member of an Organization?{" "}
                  <Link to="/login" className="underline">
                    Log in
                  </Link>
                </>
              )}
            </div>
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