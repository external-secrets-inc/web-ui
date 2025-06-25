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

type LayoutPageWidth = "full-width" | "regular" | "compact" | "dense";

interface LayoutPageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  width?: LayoutPageWidth;
}

// TODO[cfviotti]: This is a bit hacky, but it's a good starting point.
const getContainerClasses = (width: LayoutPageWidth = "regular"): string => {
  switch (width) {
    case "full-width":
      return "w-full px-[--layout-padding]";
    case "regular":
      return "container";
    case "compact":
      return "max-w-[980px] mx-auto px-[--layout-padding]";
    case "dense":
      return "max-w-[640px] mx-auto px-[--layout-padding]";
    default:
      return "container";
  }
};

export function LayoutPage({
  title,
  description,
  children,
  className,
  width,
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
    setIsMounted(true);
  }, []);

  return (
    <LayoutPageHeaderPortalTargetContext.Provider
      value={portalHeaderActionsTargetElement}
    >
      <div
        className={cn(getContainerClasses(width), "flex flex-col pt-[--layout-padding] pb-16", className)}
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
