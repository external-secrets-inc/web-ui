import { useTheme } from '@/components/ThemeProvider';
import { cn } from "@/lib/utils";
import CodeEditor, { TextareaCodeEditorProps } from '@uiw/react-textarea-code-editor';
import { forwardRef } from 'react';

/**
 * Props for the CodeTextarea component. Extends TextareaCodeEditor props but
 * removes sizing props as they're handled by our Tailwind overrides.
 */
type CodeTextareaProps = Omit<TextareaCodeEditorProps, 'minHeight' | 'padding'>;

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
  ({ language, className, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <CodeEditor
        ref={ref}
        language={language}
        data-color-mode={theme === 'system' ? undefined : theme}
        className={cn(
          // Base container styles mimicking our field styles with !important overrides for the editor inline styles
          "!bg-muted/50 rounded-md !text-sm !border !border-input shadow-sm px-3 py-2 placeholder:text-muted-foreground focus-within:!outline-none focus-within:!ring-1 focus-within:!ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
          className
        )}
        {...props}
      />
    );
  }
);

CodeTextarea.displayName = 'CodeTextarea';

export { CodeTextarea };
