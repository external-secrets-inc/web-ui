import type { ButtonProps } from "@/components/ui/button";
import type { CodeTextareaProps } from "@/components/ui/CodeTextarea";
import type { ReactNode } from "react";

/**
 * Represents a single code block with syntax highlighting configuration.
 */
export interface CodeBlock extends Pick<CodeTextareaProps, "language"> {
  /**
   * Display label for the tab.
   */
  label: string;
  
  /**
   * The code content to display.
   */
  code: NonNullable<CodeTextareaProps["value"]>;
  
  /**
   * Whether this code block is editable.
   * @default false
   */
  editable?: boolean;
}

/**
 * Props for the CodeViewerSheet component.
 * Supports both single code block and multi-tab modes.
 *
 * @remarks
 * Either provide `code` and `language` for single mode, or `tabs` array for multi mode.
 * Using `renderTrigger` will override the default trigger button configuration.
 */
export interface CodeViewerSheetProps {
  /**
   * Title displayed in the sheet header.
   */
  title: string;
  
  /**
   * Optional description text displayed below the title in the sheet header.
   */
  description?: string;
  
  /**
   * Optional icon element displayed next to the title.
   */
  icon?: ReactNode;
  
  /**
   * Custom className for the SheetContent wrapper.
   * Useful for adjusting sheet width or other layout properties.
   * @default "sm:max-w-2xl"
   */
  sheetClassName?: string;
  
  /**
   * Code content for single mode.
   * Required when not using `tabs` mode.
   */
  code?: NonNullable<CodeTextareaProps["value"]>;
  
  /**
   * Programming language for syntax highlighting in single mode (e.g., "javascript", "python", "yaml").
   * Required when not using `tabs` mode.
   */
  language?: CodeTextareaProps["language"];
  
  /**
   * Whether the code is editable in single mode.
   * @default false
   */
  editable?: boolean;
  
  /**
   * Array of code blocks for multi-tab mode.
   * When provided, `code` and `language` props are ignored.
   */
  tabs?: CodeBlock[];
  
  /**
   * Custom render function for the trigger element.
   * Receives an `open` callback to control sheet visibility.
   * When provided, `triggerLabel`, `triggerVariant`, and `triggerSize` are ignored.
   *
   * @param open - Function to open the sheet
   *
   * @example
   * ```tsx
   * renderTrigger={(open) => (
   *   <Button variant="ghost" size="icon" onClick={open}>
   *     <FileCodeIcon />
   *   </Button>
   * )}
   * ```
   */
  renderTrigger?: (open: () => void) => ReactNode;
  
  /**
   * Label text for the default trigger button.
   * Ignored if `renderTrigger` is provided.
   * @default "View Code"
   */
  triggerLabel?: string;
  
  /**
   * Optional icon element to display in the default trigger button.
   * Ignored if `renderTrigger` is provided.
   */
  triggerIcon?: ReactNode;
  
  /**
   * Visual variant for the default trigger button.
   * Ignored if `renderTrigger` is provided.
   * @default "default"
   */
  triggerVariant?: ButtonProps["variant"];
  
  /**
   * Size variant for the default trigger button.
   * Ignored if `renderTrigger` is provided.
   * @default "default"
   */
  triggerSize?: ButtonProps["size"];
}

