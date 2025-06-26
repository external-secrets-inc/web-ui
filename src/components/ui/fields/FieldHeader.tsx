import { FormLabel } from '@/components/ui/form';
import { FormDescription } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { LucideInfo } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export interface FieldHeaderProps {
  /**
   * The label text to display
   */
  label: string;
  /**
   * Optional description to show
   */
  description?: string;
  /**
   * Whether this field is required (shows asterisk)
   */
  required?: boolean;
  /**
   * Whether to use plain bold text instead of FormLabel.
   * Defaults to false (uses FormLabel). Set to true for field groups.
   */
  labelAsText?: boolean;
  /**
   * Whether to show description inline instead of in a popover.
   * Defaults to false (popover). Set to true for field groups.
   */
  descriptionInline?: boolean;
  /**
   * Additional CSS classes for the label
   */
  className?: string;
  /**
   * Whether to show error styling
   */
  error?: boolean;
}

/**
 * Unified component for rendering field headers with descriptions.
 * Supports different label styles and description behaviors:
 * - FormLabel vs plain text (labelAsText)
 * - Popover vs inline descriptions (descriptionInline)
 */
export function FieldHeader({
  label,
  description,
  required = false,
  labelAsText = false,
  descriptionInline = false,
  className,
  error = false,
}: FieldHeaderProps) {
  const showPopover = description && !descriptionInline;
  const showInline = description && descriptionInline;

  const popover = showPopover ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="-m-2 ml-0 size-7">
          <LucideInfo className="text-link-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="rounded-md dark:border dark:border-foreground/10 bg-base-700 dark:bg-primary-950/30 backdrop-blur-lg flex gap-3 w-max max-w-[min(600px,var(--radix-popover-content-available-width)-theme(spacing.2))] items-center p-3 data-[state=closed]:origin-[theme(spacing.4)_50%] data-[state=open]:origin-[186px_50%]"
        sideOffset={-35}
      >
        <LucideInfo className="text-link-accent" />
        <FormDescription className="text-primary-foreground">{description}</FormDescription>
      </PopoverContent>
    </Popover>
  ) : null;

  const asterisk = required ? <span className="text-destructive ml-1 text-sm leading-none">*</span> : null;

  const inline = showInline ? <FormDescription>{description}</FormDescription> : null;

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="inline-flex items-center">
        {labelAsText ? (
          <b className={cn("text-sm font-medium leading-none", error && "text-destructive")}>
            {label}
          </b>
        ) : (
          <FormLabel className="flex items-center">
            {label}
          </FormLabel>
        )}
        {popover}
        {asterisk}
      </div>
      {inline}
    </div>
  );
}