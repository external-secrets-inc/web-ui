import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  DetailsCardFieldProps,
  DetailsCardProps,
} from "./DetailsCard.interfaces";

/**
 * A reusable card component for displaying structured details with optional icon, title, and organized fields.
 *
 * Supports two usage patterns:
 * 1. Props-based: Pass an array of fields for automatic grid rendering
 * 2. Children-based: Pass custom JSX children for full layout control
 * 3. Hybrid: Use both fields and children together
 *
 * @param icon - Optional Lucide icon to display next to the title
 * @param title - Card title text
 * @param fields - Optional array of field objects to render in a responsive auto-fit grid layout
 * @param className - Optional additional CSS classes for the card
 * @param children - Optional custom content to render below fields
 */
export function DetailsCard({
  icon: Icon,
  title,
  fields,
  className,
  children,
}: DetailsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields && fields.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-6">
            {fields.map((field, index) => (
              <div key={index} className={cn("space-y-1", field.className)}>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  {field.icon && <field.icon className="h-4 w-4" />}
                  {field.label}
                </div>
                <div className="text-sm">{field.value}</div>
              </div>
            ))}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Standalone field component for manual composition within DetailsCard or custom layouts.
 *
 * @param label - Field label text
 * @param icon - Optional Lucide icon to display before the label
 * @param value - ReactNode to render as the field value
 * @param className - Optional additional CSS classes
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

