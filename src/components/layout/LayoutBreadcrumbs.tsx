import { Fragment } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLayoutBreadcrumbs } from "@/components/layout";

export function LayoutBreadcrumbs({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const breadcrumbSegments = useLayoutBreadcrumbs();

  if (breadcrumbSegments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={cn("h-11 flex items-center", className)} {...props}>
      <BreadcrumbList>
        {breadcrumbSegments.map((segment, index) => (
          <Fragment key={segment.label + segment.path}>
            <BreadcrumbItem>
              {index === breadcrumbSegments.length - 1 ? (
                <BreadcrumbPage>{segment.label}</BreadcrumbPage>
              ) : segment.navigatable && segment.path ? (
                <BreadcrumbLink asChild>
                  <Link to={segment.path}>{segment.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-muted-foreground">
                  {segment.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbSegments.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
