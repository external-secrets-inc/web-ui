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
        className={cn(
          "container mx-auto text-left flex flex-col py-4 pb-16 px-4",
          className
        )}
        {...props}
      >
        <header className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {(title || description) && (
              <div className="space-y-1 flex-grow">
                {title && <h1 className="text-2xl font-semibold">{title}</h1>}
                {description && (
                  <h2 className="text-sm text-muted-foreground">
                    {description}
                  </h2>
                )}
              </div>
            )}

            <div
              ref={portalHeaderActionsTargetRef}
              className="flex-shrink-0"
            ></div>
          </div>
        </header>

        {isMounted && <>{children}</>}
      </div>
    </LayoutPageHeaderPortalTargetContext.Provider>
  );
}
