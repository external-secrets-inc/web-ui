import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Trimmer } from "@/components/ui/Trimmer";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Global resize observer for all BadgeGroup instances.
 * This singleton manages subscriptions for all BadgeGroup components that need
 * to observe their mirrored badge lists for wrapping detection.
 */
class BadgeGroupGlobalResizeObserver {
  private observer: ResizeObserver | null = null;
  private callbacks = new Map<Element, () => void>();

  private ensureObserver() {
    if (!this.observer) {
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const callback = this.callbacks.get(entry.target);
          if (callback) callback();
        }
      });
    }
    return this.observer;
  }

  observe(element: Element, callback: () => void) {
    this.callbacks.set(element, callback);
    this.ensureObserver().observe(element);
  }

  unobserve(element: Element) {
    this.callbacks.delete(element);
    if (this.observer) {
      this.observer.unobserve(element);

      // If no more elements are being observed, disconnect the observer
      if (this.callbacks.size === 0) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }
}

// Single instance to be shared across all BadgeGroup components
const badgeGroupGlobalResizeObserver = new BadgeGroupGlobalResizeObserver();

export interface BadgeItem extends Omit<BadgeProps, "children"> {
  /** The unique identifier for the badge. */
  id: string;
  /** The text to display for the badge when no children is provided. */
  label?: string;
  /** Optional icon to display alongside the badge. Can be a component type or JSX element. */
  icon?:
    | React.ComponentType<{ className?: string }>
    | React.ReactElement
    | null;
  /** Custom content to render inside the badge. Overrides label and icon when provided. */
  children?: React.ReactNode;
}

export interface BadgeGroupProps {
  /** Array of badge items to display. */
  badges: BadgeItem[];
  /** Maximum number of badges to show before truncating. */
  maxCount?: number | "auto";
  /** Custom className for the container. */
  className?: string;
  /** Custom badge item for the extra counter. Receives the formatted count. */
  extraBadge?: Omit<BadgeItem, "children"> & {
    children?: (count: React.ReactNode) => React.ReactNode;
  };
  /** Whether to show the extra counter badge. */
  showExtraBadge?: boolean;
}

/**
 * BadgeGroup component that intelligently truncates badges based on available space.
 *
 * Features:
 * - Automatic detection of how many badges fit in the container width
 * - Smart "+N more" counter when badges overflow
 * - Configurable max count (number, "auto", or undefined for no limit)
 * - Responsive to container resizing
 * - Intelligent wrapping behavior based on maxCount:
 *   - "auto": No wrapping (single row) for optimal space utilization
 *   - number/undefined: Wrapping allowed for natural flow
 *
 * The "auto" mode uses a clever mirror technique with ResizeObserver to detect
 * when badges wrap to a new line, automatically calculating the optimal count.
 */
export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  (
    {
      badges,
      maxCount,
      className,
      extraBadge,
      showExtraBadge = true,
      ...props
    },
    ref
  ) => {
    const [computedMaxCount, setComputedMaxCount] = React.useState<
      number | undefined
    >(typeof maxCount === "number" ? maxCount : undefined);

    const badgeRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const observedMirroredBadgeListRef = React.useRef<HTMLDivElement>(null);

    const isAutoMaxCount = maxCount === "auto";
    const visibleBadgesCount =
      computedMaxCount !== undefined
        ? Math.min(computedMaxCount, badges.length)
        : badges.length;
    const extraBadgesCount = badges.length - visibleBadgesCount;
    const shouldShowExtraCounterBadge = extraBadgesCount > 0 && showExtraBadge;

    const detectFlexWrap = React.useCallback(() => {
      const baselineTop = 0; // Relative to first parent with non `static` css position set

      for (let i = 0; i < badges.length; i++) {
        const badge = badgeRefs.current.get(badges[i].id);
        if (!badge) continue;

        if (badge.offsetTop > baselineTop) {
          setComputedMaxCount(i);
          return;
        }
      }

      setComputedMaxCount(badges.length);
    }, [badges]);

    React.useEffect(
      function subscribeAutoMaxCountObserver() {
        if (!isAutoMaxCount) return;
        if (badges.length < 1) {
          setComputedMaxCount(badges.length);
          return;
        }

        const mirrorRef = observedMirroredBadgeListRef.current;
        if (!mirrorRef) return;

        badgeGroupGlobalResizeObserver.observe(mirrorRef, detectFlexWrap);
        queueMicrotask(detectFlexWrap);

        return function cleanupAutoMaxCountObserver() {
          if (mirrorRef) badgeGroupGlobalResizeObserver.unobserve(mirrorRef);
        };
      },
      [isAutoMaxCount, badges, detectFlexWrap]
    );

    React.useEffect(
      function resetComputedMaxCountOnPropChange() {
        setComputedMaxCount(
          typeof maxCount === "number" ? maxCount : undefined
        );
      },
      [maxCount]
    );

    const formatExtraCount = React.useCallback(
      (count: number) => (
        <span className="font-mono min-w-[2ch] text-center inline-block">
          {visibleBadgesCount === 0 ? count : `+${count}`}
        </span>
      ),
      [visibleBadgesCount]
    );

    const renderIcon = React.useCallback((icon: BadgeItem["icon"]) => {
      if (!icon) return null;
      return typeof icon === "function"
        ? React.createElement(icon, { className: "text-muted-foreground" })
        : React.cloneElement(icon, { className: "text-muted-foreground" });
    }, []);

    const renderBadge = React.useCallback(
      (
        badgeItem: BadgeItem,
        defaults?: Partial<BadgeItem>,
        content?: React.ReactNode | ((resolved: BadgeItem) => React.ReactNode),
        elementRef?: React.Ref<HTMLDivElement>
      ) => {
        const {
          className: itemClassName,
          variant: itemVariant,
          id: itemId,
          ...passThroughProps
        } = badgeItem;

        return (
          <Badge
            key={itemId}
            ref={elementRef}
            variant={itemVariant ?? defaults?.variant}
            className={cn(
              "flex items-center gap-1.5",
              defaults?.className,
              itemClassName
            )}
            id={itemId}
            {...passThroughProps}
          >
            {typeof content === "function"
              ? content({
                  id: itemId,
                  variant: itemVariant,
                  className: itemClassName,
                  ...passThroughProps,
                } as BadgeItem)
              : badgeItem.children ?? content}
          </Badge>
        );
      },
      []
    );

    const renderExtraBadge = React.useCallback(
      (count: number) => {
        const formattedCount = formatExtraCount(count);

        if (!extraBadge) {
          return renderBadge(
            { id: "extra" } as BadgeItem,
            { variant: "outline" },
            formattedCount
          );
        }

        return renderBadge(
          {
            id: extraBadge.id,
            variant: extraBadge.variant,
            className: extraBadge.className,
          } as BadgeItem,
          { variant: "outline" },
          () =>
            extraBadge.children ? (
              extraBadge.children(formattedCount)
            ) : (
              <>
                {renderIcon(extraBadge.icon)}
                {formattedCount}
              </>
            )
        );
      },
      [extraBadge, formatExtraCount, renderBadge, renderIcon]
    );

    const renderBadgeList = React.useCallback(
      ({ isMirrored }: { isMirrored: boolean }) => {
        const list = isMirrored ? badges : badges.slice(0, visibleBadgesCount);
        const hiddenBadges = badges.slice(visibleBadgesCount);
        const LabelComp = (isMirrored ? "span" : Trimmer) as React.ElementType;
        const containerClasses = cn(
          "max-w-full flex min-w-0 gap-1",
          isMirrored
            ? "items-end flex-wrap-reverse absolute top-0 invisible pointer-events-none [&>*]:pointer-events-none"
            : "items-start"
        );
        const innerClasses = cn(
          "flex min-w-0 gap-1",
          isMirrored
            ? "flex-wrap flex-1 min-w-12"
            : cn(
                !isAutoMaxCount && "flex-wrap",
                visibleBadgesCount === 0 && "hidden"
              )
        );

        const renderHiddenTooltip = (child: React.ReactNode) => (
          <Tooltip>
            <TooltipTrigger asChild>{child}</TooltipTrigger>
            <TooltipContent className="max-h-64 overflow-auto p-2">
              <div className="flex flex-col gap-1">
                {hiddenBadges.map((hidden) =>
                  renderBadge(
                    hidden,
                    { variant: "secondary", className: "min-w-0" },
                    (resolved) =>
                      resolved.children ?? (
                        <>
                          {renderIcon(hidden.icon)}
                          <span className="flex-1 min-w-0 truncate">
                            {hidden.label}
                          </span>
                        </>
                      )
                  )
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );

        return (
          <div
            className={containerClasses}
            aria-hidden={isMirrored || undefined}
          >
            <div
              className={innerClasses}
              ref={isMirrored ? observedMirroredBadgeListRef : undefined}
            >
              {list.map((badge) =>
                renderBadge(
                  badge,
                  { variant: "secondary", className: "min-w-0" },
                  (resolved) =>
                    resolved.children ?? (
                      <>
                        {renderIcon(badge.icon)}
                        <LabelComp className="flex-1 min-w-0 truncate">
                          {badge.label}
                        </LabelComp>
                      </>
                    ),
                  isMirrored
                    ? (el) => {
                        if (el) badgeRefs.current.set(badge.id, el);
                        else badgeRefs.current.delete(badge.id);
                      }
                    : undefined
                )
              )}
              {/* Extra counter badge for non-auto mode (visible list only, inside to wrap naturally) */}
              {!isMirrored &&
                !isAutoMaxCount &&
                shouldShowExtraCounterBadge &&
                renderHiddenTooltip(renderExtraBadge(extraBadgesCount))}
            </div>
            {/* Extra counter badge for auto mode must be outside the flex container to avoid wrapping! */}
            {(isMirrored
              ? showExtraBadge
              : isAutoMaxCount && shouldShowExtraCounterBadge) &&
              (isMirrored
                ? renderExtraBadge(extraBadgesCount)
                : renderHiddenTooltip(renderExtraBadge(extraBadgesCount)))}
          </div>
        );
      },
      [
        badges,
        badgeRefs,
        extraBadgesCount,
        isAutoMaxCount,
        showExtraBadge,
        observedMirroredBadgeListRef,
        renderBadge,
        renderExtraBadge,
        renderIcon,
        shouldShowExtraCounterBadge,
        visibleBadgesCount,
      ]
    );

    return (
      <div
        ref={ref}
        className={cn("w-full relative overflow-clip items-start", className)}
        {...props}
      >
        <>
          {renderBadgeList({ isMirrored: false })}
          {/**
           * Non-Interactive Badge List Mirror:
           * -------------------------
           * Why:
           *   In "auto" mode for maxCount, our goal is to determine exactly how many
           *   badges can fit in the available width. We need to detect when badges
           *   are forced to wrap onto a new line so we can replace the overflow with
           *   a "+N more" badge. Measuring this directly on the visible badge
           *   list is problematic because hiding badges for layout adjustments would
           *   break the measurement logic. This invisible mirrored list allows us to
           *   observe the full, unhindered badge layout using a ResizeObserver,
           *   without disturbing the user's view.
           *
           * Note:
           *   Ensure that any visual changes applied to the visible badges for
           *   "auto" mode are also reflected in this mirrored list to keep the
           *   measurements accurate.
           */}
          {isAutoMaxCount && renderBadgeList({ isMirrored: true })}
        </>
      </div>
    );
  }
);

BadgeGroup.displayName = "BadgeGroup";
