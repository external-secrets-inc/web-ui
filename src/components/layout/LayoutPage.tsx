import { useLayoutBreadcrumbs } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

const LayoutPageHeaderPortalTargetContext =
  createContext<HTMLDivElement | null>(null);

export function useLayoutPageHeaderPortalTarget() {
  const context = useContext(LayoutPageHeaderPortalTargetContext);
  return context;
}

type LayoutPageWidth = "full-width" | "regular" | "compact" | "dense";

interface LayoutPageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
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
  const breadcrumbSegments = useLayoutBreadcrumbs();
  const backCrumb = useMemo(() => {
    // Walk up the breadcrumb trail (excluding current) to find the nearest navigable ancestor
    for (let i = breadcrumbSegments.length - 2; i >= 0; i -= 1) {
      const segment = breadcrumbSegments[i];
      if (segment?.navigatable && segment.path) {
        return segment;
      }
    }
    return undefined;
  }, [breadcrumbSegments]);

  const backHref = backCrumb?.path;
  const showBackButton = Boolean(backHref);

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
        className={cn(
          getContainerClasses(width),
          "flex flex-col pt-[--layout-padding] pb-16",
          className
        )}
        {...props}
      >
        <header className="mb-6" data-layout-contain-on-x-scroll>
          <div className="flex items-center gap-2 flex-wrap-reverse mb-1">
            {showBackButton && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="-ml-2 -mt-1 -mb-1.5 -mr-0.5 size-8"
              >
                <Link to={backHref!} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>
            )}
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
