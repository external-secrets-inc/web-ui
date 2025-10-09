import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  DetailsCardFieldProps,
  DetailsCardProps,
} from "./DetailsCard.interfaces";

/**
 * A reusable card component for displaying structured details with optional
 * icon, title, and organized fields in a consistent manner.
 */
export function DetailsCard({
  icon: Icon,
  title,
  fields,
  sections,
  className,
  children,
}: DetailsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <CardTitle className="flex text-lg items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {fields && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-6 mt-2">
            {fields.map((field, index) => (
              <div key={index} className={cn("space-y-1", field.className)}>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  {field.icon && <field.icon className="h-4 w-4" />}
                  {field.label}
                </div>
                <div className="text-sm font-mono [word-break:break-word]">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}
        {sections && sections.length > 0 && (
          <>
            {(fields && fields.length > 0) && <Separator />}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {sectionIndex > 0 && <Separator className="mb-5"/>}
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-baseZ tracking-tight flex items-center gap-2">
                    {section.icon && <section.icon className="h-4 w-4" />}
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-6">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className={cn("space-y-1", field.className)}>
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          {field.icon && <field.icon className="h-4 w-4" />}
                          {field.label}
                        </div>
                        <div className="text-sm font-mono [word-break:break-word]">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Standalone field component for manual composition within DetailsCard or custom layouts.
 *
 * @example
 * ```tsx
 * <DetailsCardField
 *   label="Status"
 *   icon={LucideCheck}
 *   value="Active"
 * />
 * ```
 */
export function DetailsCardField({
  label,
  icon: Icon,
  value,
  className,
}: DetailsCardFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

DetailsCard.Field = DetailsCardField;
