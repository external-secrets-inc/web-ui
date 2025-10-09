import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { CodeViewerSheetProps } from "./CodeViewerSheet.interfaces";

/**
 * A reusable component for viewing code with syntax highlighting in a sheet panel.
 * Supports both single code blocks and multiple code blocks via tabs.
 *
 * @example
 * Single code block:
 * ```tsx
 * <CodeViewerSheet
 *   code={yamlManifest}
 *   language="yaml"
 *   title="Deployment Manifest"
 *   description="Generated Kubernetes configuration"
 *   icon={<FileCodeIcon />}
 *   editable={false}
 *   triggerLabel="View Manifest"
 *   triggerIcon={<FileCodeIcon />}
 *   triggerVariant="outline"
 *   triggerSize="sm"
 * />
 * ```
 *
 * @example
 * Multiple code blocks with tabs:
 * ```tsx
 * <CodeViewerSheet
 *   title="API Examples"
 *   description="Choose your preferred language"
 *   icon={<CodeIcon />}
 *   tabs={[
 *     { label: "JavaScript", language: "javascript", code: jsCode },
 *     { label: "Python", language: "python", code: pyCode },
 *   ]}
 *   triggerLabel="View Examples"
 *   triggerIcon={<CodeIcon />}
 * />
 * ```
 *
 * @example
 * Custom trigger with render prop:
 * ```tsx
 * <CodeViewerSheet
 *   code={yamlManifest}
 *   language="yaml"
 *   title="Deployment Manifest"
 *   icon={<FileCodeIcon />}
 *   renderTrigger={(open) => (
 *     <Button variant="ghost" size="icon" onClick={open}>
 *       <FileCodeIcon />
 *     </Button>
 *   )}
 * />
 * ```
 */
export function CodeViewerSheet({
  title,
  description,
  icon,
  sheetClassName,
  code,
  language,
  editable = false,
  tabs,
  renderTrigger,
  triggerLabel = "View Code",
  triggerIcon,
  triggerVariant = "default",
  triggerSize = "default",
}: CodeViewerSheetProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.label ?? "");

  const handleOpen = () => setOpen(true);

  const isMultiMode = tabs && tabs.length > 0;
  const isSingleMode = !isMultiMode && code && language;

  if (!isMultiMode && !isSingleMode) {
    console.error(
      "CodeViewerSheet: Either provide 'code' and 'language' for single mode, or 'tabs' array for multi mode."
    );
    return null;
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(handleOpen)
      ) : (
        <Button
          variant={triggerVariant}
          size={triggerSize}
          onClick={handleOpen}
        >
          {triggerIcon}
          {triggerLabel}
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          className={cn(
            "flex flex-col sm:max-w-2xl overflow-hidden gap-6",
            sheetClassName
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {icon}
              {title}
            </SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          {isSingleMode && (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <CodeTextarea
                language={language}
                value={code}
                disabled={!editable}
                className="flex-initial min-h-[400px] resize-none !overflow-auto"
              />
            </div>
          )}

          {isMultiMode && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col gap-3 flex-1 min-h-0"
            >
              <TabsList className="w-fit">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.label} value={tab.label}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent
                  key={tab.label}
                  value={tab.label}
                  className="flex flex-col gap-3 flex-1 min-h-0 data-[state=active]:flex"
                >
                  <Badge variant="outline" className="w-fit">
                    Language: {tab.language}
                  </Badge>
                  <CodeTextarea
                    language={tab.language}
                    value={tab.code}
                    disabled={!(tab.editable ?? false)}
                    className="flex-initial min-h-[400px] resize-none !overflow-auto"
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
