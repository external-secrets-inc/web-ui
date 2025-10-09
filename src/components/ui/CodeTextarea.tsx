import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import CodeEditor, {
  TextareaCodeEditorProps,
} from "@uiw/react-textarea-code-editor";
import {
  LucideClipboardCheck,
  LucideClipboardCopy,
  LucideCode,
} from "lucide-react";
import { forwardRef, useEffect, useState } from "react";

/**
 * Props for the CodeTextarea component. Extends TextareaCodeEditor props but
 * removes sizing props as they're handled by our Tailwind overrides.
 */
export type CodeTextareaProps = Omit<
  TextareaCodeEditorProps,
  "minHeight" | "padding"
>;

/**
 * A simple code editor component with syntax highlighting.
 * Wraps the @uiw/react-textarea-code-editor with our custom styling.
 *
 * @example
 * ```tsx
 * <CodeTextarea
 *   language="json"
 *   value={code}
 *   onChange={setCode}
 *   className="min-h-[100px] p-4"
 * />
 * ```
 *
 * @see https://uiwjs.github.io/react-textarea-code-editor/
 */
const CodeTextarea = forwardRef<HTMLTextAreaElement, CodeTextareaProps>(
  ({ language, className, disabled, ...props }, ref) => {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (copied) {
        const timeout = setTimeout(() => {
          setCopied(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }, [copied]);

    const handleCopy = async () => {
      if (props.value) {
        await navigator.clipboard.writeText(String(props.value));
        setCopied(true);
      }
    };

    return (
      <div
        className={cn(
          "group relative bg-background flex flex-col whitespace-pre rounded-md text-sm border border-input transition-all shadow-sm [&:not(:has(button:focus)):focus-within]:outline-none [&:not(:has(button:focus)):focus-within]:ring-1 [&:not(:has(button:focus)):focus-within]:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !disabled && "hover:border-input-accent bg-muted/50",
          className
        )}
      >
        <div className="sticky w-full top-0 left-0 right-0 p-2.5 flex h-11 -mb-11 justify-end gap-2 z-10">
          <Badge
            variant="outline"
            className="w-fit inline-flex gap-1 text-muted-foreground bg-background capitalize group-hover:opacity-0 transition-opacity duration-300 group-hover:delay-0 delay-100 ease-in-out"
          >
            <LucideCode className="size-3 text-muted-foregrod" />
            {language}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!props.value}
                className="absolute size-8 top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:delay-100 delay-0 ease-in-out"
                aria-label="Copy to clipboard"
              >
                <LucideClipboardCopy
                  className={cn(
                    "text-muted-foreground absolute inset-0 m-auto transition-opacity duration-200",
                    copied ? "opacity-0" : "delay-100 opacity-100"
                  )}
                />
                <LucideClipboardCheck
                  className={cn(
                    "text-success absolute inset-0 m-auto transition-opacity duration-200 delay-150",
                    copied ? "opacity-100" : "delay-0 opacity-0"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Copied!" : "Copy to clipboard"}
            </TooltipContent>
          </Tooltip>
        </div>
        <CodeEditor
          ref={ref}
          language={language}
          data-color-mode={theme === "system" ? undefined : theme}
          disabled={disabled}
          className={cn(
            "!bg-[unset] ![font-size:inherit] ![font-family:inherit] w-fit min-w-full",
            // Editor layout fixes
            "[&_code]:static", // override from our own index.css
            "[&_pre]:bg-transparent", // override from our own index.css
            "[&_.w-tc-editor-text]:!padding-[inherit]", // Force padding to be inherited from the container
            "[&_.w-tc-editor-preview]:!padding-[inherit]", // Force padding to be inherited from the container
            // Syntax highlighting custom colors
            "[&_.token.property]:!text-pink-600 dark:[&_.token.property]:!text-pink-400",
            "[&_.token.string]:!text-emerald-600 dark:[&_.token.string]:!text-emerald-400",
            "[&_.token.number]:!text-blue-600 dark:[&_.token.number]:!text-blue-400",
            "[&_.token.boolean]:!text-purple-600 dark:[&_.token.boolean]:!text-purple-400",
            "[&_.token.null]:!text-red-600 dark:[&_.token.null]:!text-red-400",
            "[&_.token.keyword]:!text-purple-600 dark:[&_.token.keyword]:!text-purple-400",
            "[&_.token.punctuation]:!text-muted-foreground",
            "[&_textarea]:[field-sizing:content] !min-h-fit !h-full [&_textarea]:!h-fit [&_textarea]:!min-h-full",
            "[&_textarea]:placeholder:text-muted-foreground [&_.w-tc-editor-text]:!w-fit",
            "[&_textarea]:![white-space:inherit] [&_code]:![white-pace:inherit] [&_pre]:![white-space:inherit [&_.w-tc-editor-text]:![white-space:inherit] [&_.w-tc-editor-preview]:![white-space:inherit]",
            "[&_textarea]:!w-fit [&_textarea]:!min-w-full [&_.w-tc-editor-preview]:!w-fit"
          )}
          {...props}
        />
      </div>
    );
  }
);

CodeTextarea.displayName = "CodeTextarea";

export { CodeTextarea };
