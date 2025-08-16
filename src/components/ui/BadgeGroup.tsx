import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trimmer } from "@/components/ui/Trimmer";
import { cn } from "@/lib/utils";
import * as React from "react";

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
}

function formatExtraCountNode(count: number, showPlus: boolean) {
  return (
    /**
     * The monospace font and a minimum width of 2 characters is used to ensure
     * the badge is always a stable width when we remove the `+` sign. This is
     * very important to avoid constantly triggering the resize observer when we
     * wrap ALL the badges on auto max count mode when the parent dimensions are
     * at the threshold of wrapping.
     */
    <span className="font-mono min-w-[2ch] text-center inline-block">
      {showPlus ? `+${count}` : count}
    </span>
  );
}

/**
 * Presentational wrapper for a single Badge item.
 */
function BadgeGroupItem({
  item,
  defaults,
  children,
  elementRef,
  useTrimmer = false,
}: {
  item: BadgeItem;
  defaults?: Partial<BadgeItem>;
  children?: React.ReactNode | ((resolved: BadgeItem) => React.ReactNode);
  elementRef?: React.Ref<HTMLDivElement>;
  useTrimmer?: boolean;
}) {
  const { className, variant, id, icon, label, ...rest } = item;
  const resolved: BadgeItem = {
    id,
    variant,
    className,
    icon,
    label,
    ...rest,
  } as BadgeItem;

  const defaultContent = resolved.children ?? (
    <>
      {icon &&
        (typeof icon === "function"
          ? React.createElement(icon, {
              className: "text-muted-foreground",
            })
          : React.cloneElement(icon, {
              className: "text-muted-foreground",
            }))}
      {useTrimmer ? (
        <Trimmer className="flex-1 min-w-0">{resolved.label}</Trimmer>
      ) : (
        <span className="flex-1 min-w-0 truncate">{resolved.label}</span>
      )}
    </>
  );

  const content =
    typeof children === "function"
      ? children(resolved)
      : children || defaultContent;

  return (
    <Badge
      ref={elementRef}
      id={id}
      variant={resolved.variant ?? defaults?.variant}
      className={cn(
        "flex items-center gap-1.5",
        defaults?.className,
        className
      )}
      {...rest}
    >
      {content}
    </Badge>
  );
}

/**
 * Tooltip listing hidden/wrapped badges.
 */
function HiddenBadgesTooltip({
  hiddenBadges,
  children,
}: {
  hiddenBadges: BadgeItem[];
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent className="max-h-64 max-w-64 overflow-y-auto p-2">
        <div className="flex flex-col gap-1 items-start">
          {hiddenBadges.map((hidden) => (
            <BadgeGroupItem
              key={hidden.id}
              item={hidden}
              defaults={{
                variant: "secondary",
                className: "min-w-0 max-w-full",
              }}
            />
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Extra badge renderer (icon + formatted count, or custom children(count)).
 * Optionally wraps in tooltip showing hidden badges when hiddenBadges is provided.
 */
function ExtraBadge({
  config,
  countNode,
  hiddenBadges,
}: {
  config?: BadgeGroupProps["extraBadge"];
  countNode: React.ReactNode;
  hiddenBadges?: BadgeItem[];
}) {
  const badgeContent = (
    <BadgeGroupItem
      item={
        config
          ? ({
              id: config.id,
              variant: config.variant,
              className: config.className,
            } as BadgeItem)
          : ({ id: "extra" } as BadgeItem)
      }
      defaults={{ variant: "outline" }}
    >
      {config?.children ? (
        config.children(countNode)
      ) : (
        <>
          {config?.icon &&
            (typeof config.icon === "function"
              ? React.createElement(config.icon, {
                  className: "text-muted-foreground",
                })
              : React.cloneElement(config.icon, {
                  className: "text-muted-foreground",
                }))}
          {countNode}
        </>
      )}
    </BadgeGroupItem>
  );

  if (hiddenBadges && hiddenBadges.length > 0) {
    return (
      <HiddenBadgesTooltip hiddenBadges={hiddenBadges}>
        {badgeContent}
      </HiddenBadgesTooltip>
    );
  }

  return badgeContent;
}

/**
 * Simple badge list renderer - just renders the badges without any layout logic.
 */
function BadgeList({
  badges,
  children,
  setBadgeRef,
  withTrimmerOnlyOnFirstItem = false,
}: {
  badges: BadgeItem[];
  children?: (badge: BadgeItem, index: number) => React.ReactNode;
  setBadgeRef?: (id: string, el: HTMLDivElement | null) => void;
  withTrimmerOnlyOnFirstItem?: boolean;
}) {
  return (
    <>
      {badges.map((badge, index) =>
        children ? (
          children(badge, index)
        ) : (
          <BadgeGroupItem
            key={badge.id}
            item={badge}
            defaults={{ variant: "secondary", className: "min-w-0" }}
            elementRef={
              setBadgeRef ? (el) => setBadgeRef(badge.id, el) : undefined
            }
            useTrimmer={withTrimmerOnlyOnFirstItem && index === 0}
          />
        )
      )}
    </>
  );
}

/**
 * BadgeGroup component that intelligently truncates badges based on available space.
 */
export const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  (
    { badges, maxCount, className, extraBadge: extraBadgeConfig, ...props },
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

    const detectFlexWrap = React.useCallback(() => {
      /**
       * The first parent with non `static` CSS `position` natively becomes the
       * reference for the `offsetTop` of a child element, since we do that on
       * our markup, we can safely assume `0` as the baseline.
       */
      const baselineTop = 0;

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
      (count: number) =>
        formatExtraCountNode(count, !(visibleBadgesCount === 0)),
      [visibleBadgesCount]
    );

    const setBadgeRef = React.useCallback(
      (id: string, el: HTMLDivElement | null) => {
        if (el) badgeRefs.current.set(id, el);
        else badgeRefs.current.delete(id);
      },
      []
    );

    const visibleBadges = badges.slice(0, visibleBadgesCount);
    const hiddenBadges = badges.slice(visibleBadgesCount);

    return (
      <div
        ref={ref}
        className={cn("w-full relative overflow-clip items-start", className)}
        {...props}
      >
        {/* Visible list */}
        <div className="max-w-full flex gap-1 min-w-0 items-start">
          <div
            className={cn("flex gap-1 min-w-0", !isAutoMaxCount && "flex-wrap")}
          >
            <div
              className={cn(
                "flex gap-1 min-w-0",
                !isAutoMaxCount && "contents"
              )}
            >
              <BadgeList
                badges={visibleBadges}
                withTrimmerOnlyOnFirstItem={isAutoMaxCount}
              />
            </div>

            {extraBadgesCount > 0 && (
              <ExtraBadge
                config={extraBadgeConfig}
                countNode={formatExtraCount(extraBadgesCount)}
                hiddenBadges={hiddenBadges}
              />
            )}
          </div>
        </div>

        {/**
         * Non-Interactive Badge List "Mirror":
         * ---
         * In "auto" mode for maxCount, our goal is to determine exactly how
         * many badges can fit in the available width. We need to detect when
         * badges are forced to wrap onto a new line so we can replace the
         * overflow with a "+N" extra badge. Measuring this directly on the
         * visible badge list is problematic because the very act of hiding
         * badges would break the measurement logic! This invisible mirrored
         * list allows us to observe the full, natural badge list flex-wrap
         * layout using a ResizeObserver, behind the scenes.
         *
         * Note:
         * The intricate markup and styles below are necessary to ensure the
         * mirrored list ALWAYS wraps its badges, but keep the extra "+N" badge
         * visible over their right to identically reflect the dimensions of the
         * visible list. If curious to see it in action visually, just remove
         * the `invisible` class below and the `overflow-clip` class above,
         * resize the window and watch the magic happen.
         */}
        {isAutoMaxCount && (
          <div
            className="max-w-full flex min-w-0 gap-1 items-end flex-wrap-reverse absolute top-0 invisible pointer-events-none [&>*]:pointer-events-none"
            aria-hidden
          >
            <div
              className="flex gap-1 flex-1 flex-wrap min-w-12"
              ref={observedMirroredBadgeListRef}
            >
              <BadgeList badges={badges} setBadgeRef={setBadgeRef} />
            </div>
            {(extraBadgesCount > 0 ||
              /**
               * We force to also show the extra badge when there's only one
               * badge so the list has something to trigger a flex wrap and show
               * a simple (1) count badge when there's not enough space to show
               * the single badge properly. Treating this edge case ensures
               * consistent behavior for any number of badges.
               */
              badges.length === 1) && (
              <ExtraBadge
                config={extraBadgeConfig}
                countNode={formatExtraCount(extraBadgesCount)}
                hiddenBadges={hiddenBadges}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

BadgeGroup.displayName = "BadgeGroup";
