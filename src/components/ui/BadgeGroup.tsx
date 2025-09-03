import { A11yDivButton } from "@/components/ui/A11yDivButton";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { DataStateEventBridge } from "@/components/ui/DataStateEventBridge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trimmer } from "@/components/ui/Trimmer";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { Measurable } from "@radix-ui/rect";

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

/**
 * Describes a single badge rendered by `BadgeGroup`.
 *
 * This contract builds on top of our base `BadgeProps`, but favors a higher-level
 * API where content is typically provided via `label` and optional `icon`.
 * When `children` is provided it fully overrides the composed `icon + label`.
 */
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
  /**
   * Custom content to render inside the badge. Overrides label and icon when provided.
   * When provided as a function, it receives the resolved item plus pre-formatted parts
   * so callers can compose content without breaking truncation behavior.
   */
  children?:
    | React.ReactNode
    | ((ctx: {
        resolved: BadgeItem;
        labelNode: React.ReactNode;
        iconNode?: React.ReactNode;
      }) => React.ReactNode);
}

function renderIconNode(icon?: BadgeItem["icon"]): React.ReactNode | undefined {
  if (!icon) return undefined;
  if (React.isValidElement(icon)) {
    const el = icon as React.ReactElement<{ className?: string }>;
    return React.cloneElement(el, {
      className: cn("text-muted-foreground", el.props.className),
    });
  }
  const IconComp = icon as React.ComponentType<{ className?: string }>;
  return <IconComp className="text-muted-foreground" />;
}

export interface BadgeGroupProps {
  /** Array of badge items to display, in visual order (left → right). */
  badges: BadgeItem[];
  /**
   * Maximum number of badges to show before truncating.
   * - number: clamp to the provided maximum (natural wrapping allowed).
   * - "auto": compute the optimal visible count by measuring layout to avoid wrapping.
   * - undefined: show all items (natural wrapping allowed).
   */
  maxCount?: number | "auto";
  /** Custom className for the container. */
  className?: string;
  /**
   * Custom badge item for the trailing extra counter (e.g. "+3").
   * You can customize `variant`, `className`, and optional `icon`.
   *
   * If `children` is provided, it will be invoked with a pre-formatted `count` node.
   * That node is already wrapped with a monospace, width-stabilized span
   * (`<span class="font-mono min-w-[2ch] text-center"/>`) and conditionally
   * includes a leading plus sign when there are visible items.
   * Use it directly so alignment stays consistent across counts.
   */
  extraBadge?: Omit<BadgeItem, "children"> & {
    children?: (count: React.ReactNode) => React.ReactNode;
    /** Optional virtual anchor (e.g., EsiSelect trigger) to position the popover content against. */
    popoverAnchorVirtualRef?: MeasurableRef;
    /** When true, the popover content width matches the anchor element's width. */
    matchPopoverContentWidthToAnchorVirtualRef?: boolean;
  };

  /**
   * Optional callback that is invoked whenever the layout (visible/hidden split)
   * is recalculated. Useful for consumers that need to react to the computed
   * visible/hidden counts, e.g., to trim data in response to user actions.
   */
  onLayoutUpdate?: (state: {
    /** Subset of `badges` currently visible. */
    visibleBadges: BadgeItem[];
    /** Subset of `badges` currently hidden (wrapped or truncated). */
    hiddenBadges: BadgeItem[];
    /** Number of visible badges. */
    visibleCount: number;
    /** Number of hidden badges (i.e., total - visible). */
    hiddenCount: number;
  }) => void;
}

/**
 * Formats the numeric count for the extra badge as a width-stable node.
 */
function formatExtraCountNode({
  count,
  showPlus,
}: {
  /** The number of hidden items represented by the counter. */
  count: number;
  /** When true, prefix the count with a plus sign (e.g., "+3"). */
  showPlus: boolean;
}) {
  return (
    /**
     * The monospace font and the invisible `+` sign is used to ensure
     * the badge is always a stable width when we remove the `+` sign. This is
     * very important to avoid constantly triggering the resize observer when we
     * wrap ALL the badges on auto max count mode when the parent dimensions are
     * at the threshold of wrapping.
     */
    <span
      className={cn(
        "font-mono text-center inline-block",
        !showPlus && "-ml-[0.5ch] pr-[0.5ch]"
      )}
    >
      <span className={cn(!showPlus && "invisible")}>+</span>
      <span>{count}</span>
    </span>
  );
}

/**
 * Presentational wrapper for a single Badge item.
 * Renders either the default composition (icon + label) or a custom `children` override.
 * When `useTrimmer` is true, the label uses `Trimmer` instead of a truncated span.
 */
function BadgeGroupItem({
  item,
  defaults,
  children,
  elementRef,
  useTrimmer = false,
}: {
  /** Badge data to render. */
  item: BadgeItem;
  /** Default props applied when they are absent from `item`. */
  defaults?: Partial<BadgeItem>;
  /** Optional render override. If function, receives the resolved item and parts. */
  children?:
    | React.ReactNode
    | ((ctx: {
        resolved: BadgeItem;
        labelNode: React.ReactNode;
        iconNode?: React.ReactNode;
      }) => React.ReactNode);
  /** Optional ref to the underlying badge element. */
  elementRef?: React.Ref<HTMLDivElement>;
  /** When true, the label is rendered with `Trimmer` for smart truncation. */
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

  const labelNode = useTrimmer ? (
    <Trimmer className="flex-1 min-w-0">{resolved.label}</Trimmer>
  ) : (
    <span className="flex-1 min-w-0 truncate">{resolved.label}</span>
  );

  const iconNode = renderIconNode(icon);

  const defaultContent =
    typeof resolved.children === "function"
      ? resolved.children({
          resolved,
          labelNode,
          iconNode: iconNode ?? undefined,
        })
      : resolved.children ?? (
          <>
            {iconNode}
            {labelNode}
          </>
        );

  const content =
    typeof children === "function"
      ? children({ resolved, labelNode, iconNode: iconNode ?? undefined })
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
 * Wraps a trigger (typically the extra counter badge) and shows the hidden items.
 */
type MeasurableRef = React.RefObject<Measurable>;

function HiddenBadgesTooltip({
  hiddenBadges,
  children,
  popoverAnchorVirtualRef,
  matchPopoverContentWidthToAnchorVirtualRef,
}: {
  /** Hidden portion of the badge list. */
  hiddenBadges: BadgeItem[];
  /** Trigger to open the tooltip. */
  children: React.ReactNode;
  /** Optional virtual anchor to position content against another element. */
  popoverAnchorVirtualRef?: MeasurableRef;
  /** When true, overlay content width matches the anchor element's width. */
  matchPopoverContentWidthToAnchorVirtualRef?: boolean;
}) {
  return (
    <Popover>
      {popoverAnchorVirtualRef ? (
        <PopoverAnchor virtualRef={popoverAnchorVirtualRef} />
      ) : null}
      <Tooltip delayDuration={200}>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <DataStateEventBridge>
              <A11yDivButton variant="unstyled">{children}</A11yDivButton>
            </DataStateEventBridge>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent>View more</TooltipContent>
      </Tooltip>
      <PopoverContent
        sticky="always"
        align="end"
        className={cn(
          "min-w-full w-max max-w-[min(calc(100dvw-theme(spacing.4)),512px)] max-h-[min(456px,var(--radix-popover-content-available-height))] overflow-auto p-2 origin-[--radix-popover-content-transform-origin] shadow-lg",
          matchPopoverContentWidthToAnchorVirtualRef &&
            "min-w-[--radix-popover-trigger-width]"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap gap-0.5 items-start">
          {hiddenBadges.map((hidden) => (
            <BadgeGroupItem
              key={hidden.id}
              item={hidden}
              useTrimmer={true}
              defaults={{
                variant: "secondary",
                className: "min-w-0 max-w-full",
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Extra badge renderer (icon + formatted count, or custom children(count)).
 * Optionally wraps in tooltip showing hidden badges when `hiddenBadges` is provided.
 */
function ExtraBadge({
  config,
  countNode,
  hiddenBadges,
}: {
  /** Visual configuration of the counter badge (variant, className, optional icon). */
  config?: BadgeGroupProps["extraBadge"];
  /** Pre-formatted count node provided by the group (width-stable). */
  countNode: React.ReactNode;
  /** Hidden badges that will be displayed inside the tooltip if present. */
  hiddenBadges?: BadgeItem[];
}) {
  const badgeContent = (
    <BadgeGroupItem
      item={
        config
          ? ({
              id: config.id,
              variant: config.variant,
              className: cn(
                config.className,
                "hover:bg-accent hover:border-input-accent"
              ),
            } as BadgeItem)
          : ({ id: "extra" } as BadgeItem)
      }
      defaults={{ variant: "outline" }}
    >
      {config?.children ? (
        config.children(countNode)
      ) : (
        <>
          {renderIconNode(config?.icon)}
          {countNode}
        </>
      )}
    </BadgeGroupItem>
  );

  if (hiddenBadges && hiddenBadges.length > 0) {
    return (
      <HiddenBadgesTooltip
        hiddenBadges={hiddenBadges}
        popoverAnchorVirtualRef={config?.popoverAnchorVirtualRef}
        matchPopoverContentWidthToAnchorVirtualRef={
          config?.matchPopoverContentWidthToAnchorVirtualRef
        }
      >
        {badgeContent}
      </HiddenBadgesTooltip>
    );
  }

  return badgeContent;
}

/**
 * Simple badge list renderer - just renders the badges without any layout
 * logic. You may provide a render override per item via `children`. When
 * `setBadgeRef` is supplied, each rendered item forwards its element ref keyed
 * by id. If `withTrimmerOnlyOnFirstItem` is true, only the first item uses
 * `Trimmer` for its label (Useful for auto max count mode where that's the only
 * item that will actually be truncated).
 */
function BadgeList({
  badges,
  children,
  setBadgeRef,
  withTrimmerOnlyOnFirstItem = false,
}: {
  /** Items to render. */
  badges: BadgeItem[];
  /** Optional render override for each badge. */
  children?: (badge: BadgeItem, index: number) => React.ReactNode;
  /** Collects DOM refs keyed by badge id (used for wrap detection in auto mode). */
  setBadgeRef?: (id: string, el: HTMLDivElement | null) => void;
  /** When true, only the first item uses `Trimmer` for its label. */
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
    {
      badges,
      maxCount,
      className,
      extraBadge: extraBadgeConfig,
      onLayoutUpdate,
      ...props
    },
    ref
  ) => {
    const [computedMaxCount, setComputedMaxCount] = React.useState<
      number | undefined
    >(typeof maxCount === "number" ? maxCount : undefined);
    const [badgeHeight, setBadgeHeight] = React.useState<number>(0);

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
        if (i === 0) {
          setBadgeHeight(
            badgeRefs.current.get(badges[i].id)?.offsetHeight ?? 0
          );
        }
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
        formatExtraCountNode({ count, showPlus: !(visibleBadgesCount === 0) }),
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

    React.useEffect(
      function notifyLayoutUpdate() {
        if (!onLayoutUpdate) return;
        const visible = badges.slice(0, visibleBadgesCount);
        const hidden = badges.slice(visibleBadgesCount);
        onLayoutUpdate({
          visibleBadges: visible,
          hiddenBadges: hidden,
          visibleCount: visible.length,
          hiddenCount: hidden.length,
        });
      },
      [onLayoutUpdate, badges, visibleBadgesCount]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "w-full min-w-0 relative overflow-clip inline-flex",
          className
        )}
        {...props}
        style={{ "--badge-height": `${badgeHeight}px` } as React.CSSProperties}
      >
        {/* Visible list */}
        <div
          className={cn(
            "flex gap-x-0.5 gap-y-1 min-w-0 flex-wrap",
            isAutoMaxCount && "h-[--badge-height]"
          )}
        >
          <div className="flex gap-x-0.5 gap-y-1 min-w-0 flex-wrap flex-1 max-w-fit">
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
            className="max-w-full flex min-w-0 gap-x-0.5 gap-y-1 items-end flex-wrap-reverse absolute top-0 invisible pointer-events-none [&>*]:pointer-events-none"
            aria-hidden
          >
            <div
              className="flex gap-x-0.5 gap-y-1 flex-1 flex-wrap min-w-12"
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
