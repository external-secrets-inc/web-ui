import * as React from "react";
import { LucideSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useData } from "./DataProviderContext"; // Accesses global filter state and setter

/**
 * Provides a simple text input for global filtering within a DataProvider context.
 * Updates the `globalFilter` state managed by the `useDataProvider` hook.
 */
export const DataSearch = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { globalFilter, setGlobalFilter } = useData();

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <Input
        placeholder="Search..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-48 pr-7"
      />
      <LucideSearch className="absolute inset-y-0 right-3 self-center text-muted-foreground" />
    </div>
  );
});
DataSearch.displayName = "DataSearch";