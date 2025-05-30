import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

const LayoutPageHeaderPortalTargetContext =
  createContext<HTMLDivElement | null>(null);

export function useLayoutPageHeaderPortalTarget() {
  const context = useContext(LayoutPageHeaderPortalTargetContext);
  return context;
}

interface LayoutPageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function LayoutPage({
  title,
  description,
  children,
  className,
  ...props
}: LayoutPageProps) {
  const portalHeaderActionsTargetRef = useRef<HTMLDivElement>(null);
  const [
    portalHeaderActionsTargetElement,
    setPortalHeaderActionsTargetElement,
  ] = useState<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (portalHeaderActionsTargetRef.current) {
      setPortalHeaderActionsTargetElement(portalHeaderActionsTargetRef.current);
    }
    setIsMounted(true); // Set mounted to true after ref is potentially set
  }, []);

  return (
    <LayoutPageHeaderPortalTargetContext.Provider
      value={portalHeaderActionsTargetElement}
    >
      <div
        className={cn("container flex flex-col py-4 pb-16", className)}
        {...props}
      >
        <header className="mb-6" data-layout-contain-on-x-scroll>
          <div className="flex items-center gap-2 flex-wrap-reverse mb-1">
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            <div
              ref={portalHeaderActionsTargetRef}
              className="ml-auto flex-none items-center"
            />
          </div>
          {description && (
            <h2 className="text-sm text-muted-foreground">{description}</h2>
          )}
        </header>

        {isMounted && <>{children}</>}
      </div>
    </LayoutPageHeaderPortalTargetContext.Provider>
  );
}
