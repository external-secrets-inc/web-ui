import BGAuthHero from "@/assets/bg-auth-hero.jpg";
import BGNoise from "@/assets/bg-noise.png";
import BGBlob1 from "@/assets/bg-blob-1.png";
import BGBlob2 from "@/assets/bg-blob-2.png";
import logoESIFullWhite from "@/assets/logo-esi-full-white.svg";
import { WEBSITE_DOMAIN } from "@/constants";
import { Link, Outlet } from "react-router-dom";

/**
 * Provides the common layout structure for authentication pages (Login, Signup, etc.).
 * Includes background elements, branding, and a placeholder for page-specific content.
 */
export function AuthLayout() {
  return (
    <div className="p-2 lg:p-14 xl:p-20 min-h-dvh flex flex-col">
      <div className="z-10 lg:w-full lg:flex-1 flex flex-col max-w-full lg:max-w-[1600px] m-auto lg:grid lg:grid-cols-[minmax(30%,60%)_minmax(auto,auto)] rounded-[32px] overflow-hidden bg-background dark:bg-background/90">
        <aside className="relative contain-content p-8 py-6 sm:py-8 lg:p-16 xl:p-20 flex flex-col flex-0 gap-6 items-start justify-between rounded-[inherit] [container-type:inline-size]">
          <Link
            to={WEBSITE_DOMAIN}
            className="self-center sm:self-start"
            tabIndex={-1}
          >
            <img
              className="h-7 sm:h-10 lg:h-12 w-auto"
              src={logoESIFullWhite}
              alt="External Secrets"
            />
          </Link>
          <h1 className="hidden sm:block font-bold text-base-50 text-[6cqw] leading-[1.2]">
            Solve secrets chaos forever. <br />
            Your path to clarity <span className="text-primary-400 mix-blend-plus-lighter">starts here</span>.
          </h1>
          <div className="absolute inset-0 overflow-hidden border-transparent border-8 bg-clip-padding rounded-[inherit] opacity-95 dark:opacity-75 -z-10">
            <div className="animate-bg-auth-hero-scroll motion-reduce:animate-none">
              <img
                src={BGAuthHero}
                alt=""
                role="presentation"
                className="w-full"
              />
              <img
                src={BGAuthHero}
                alt=""
                role="presentation"
                className="w-full"
              />
            </div>
          </div>
        </aside>

        <div className="flex flex-col gap-6 items-center justify-between p-8 pb-12 lg:p-14 flex-1">
          <main className="m-auto grid max-w-[352px] w-full min-w-0 gap-8">
            <Outlet />
          </main>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden bg-auth-gradient -z-10">
        <div className="absolute inset-0 translate-z-0">
          <img
            src={BGBlob1}
            alt=""
            role="presentation"
            className="absolute bottom-0 left-0 animate-bg-auth-blob-animation-1 motion-reduce:animate-none"
          />
          <img
            src={BGBlob2}
            alt=""
            role="presentation"
            className="absolute top-0 right-0 animate-bg-auth-blob-animation-2 motion-reduce:animate-none"
          />
        </div>
        <div
          className="absolute inset-0 bg-[length:150px]"
          style={{ backgroundImage: `url('${BGNoise}')` }}
        />
      </div>
    </div>
  );
}
