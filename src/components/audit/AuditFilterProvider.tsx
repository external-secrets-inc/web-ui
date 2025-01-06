import { createContext, useContext, useCallback, ReactNode, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterSchema, filterSchema } from "./Audit.interfaces";
import { useDebounce } from "@/hooks/useDebounce";

interface AuditFilterContextValue {
  isFiltersDialogOpen: boolean;
  setIsFiltersDialogOpen: (open: boolean) => void;
  handleFilterChange: (selectedFilters: FilterSchema) => void;
  handleFilterNameChange: (name: string) => void;
  currentFilters: FilterSchema;
}

const AuditFilterContext = createContext<AuditFilterContextValue | null>(null);

interface AuditFilterProviderProps {
  children: ReactNode;
}

export function AuditFilterProvider({ children }: AuditFilterProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [searchNameParam, setSearchNameParam] = useState("");
  const debouncedSearchNameParam = useDebounce(searchNameParam, 300);


  const currentFilters = useMemo((): FilterSchema => {
    return {
      providers: searchParams.getAll("providers"),
      policyIDs: searchParams.getAll("policyIDs"),
      secretIDs: searchParams.getAll("secretIDs"),
      name: searchParams.get("name") ?? undefined,
      policyStatus: searchParams.get("policyStatus") ?? undefined,
      duplicates: searchParams.get("duplicates") ?? undefined,
      lastAccess: searchParams.get("lastAccess") ?? undefined,
      lastRotation: searchParams.get("lastRotation") ?? undefined,
      accessors: searchParams.get("accessors") ?? undefined,
    } as FilterSchema;
  }, [searchParams]);

  const handleFilterChange = useCallback((selectedFilters: FilterSchema) => {
    setSearchParams((prevParams) => {
      // First, remove all existing filter parameters specifically to avoid stale values
      filterSchema.keyof().options.forEach((key) => prevParams.delete(key));

      // Then add new filter values if they exist
      for (const [key, value] of Object.entries(selectedFilters)) {
        if (!value) continue; // Skip unset values

        if (Array.isArray(value)) {
          // For array values (like providers), set each value as a separate entry
          // TODO: Consider if we should use a single key with delimiters for each value instead
          if (value.length) {
            value.forEach((value) => prevParams.append(key, value));
          }
        } else {
          // For single values, just set them directly
          prevParams.set(key, value);
        }
      }

      return prevParams;
    });

    setIsFiltersDialogOpen(false);
  }, [setSearchParams]);

  
  const handleFilterNameChange = useCallback((name: string) => {
    setSearchNameParam(name);
  }, [setSearchNameParam]);

  useEffect(() => {
    if(debouncedSearchNameParam != null) {
      setSearchParams((prevParams) => {
        if (!searchNameParam) {
          prevParams.delete("name");
          return prevParams;
        }

        prevParams.set("name", searchNameParam);
        return prevParams;
      })
    }
  }, [debouncedSearchNameParam])

  const value = useMemo(() => ({
    isFiltersDialogOpen,
    setIsFiltersDialogOpen,
    handleFilterChange,
    handleFilterNameChange,
    currentFilters,
  }), [isFiltersDialogOpen, handleFilterChange, handleFilterNameChange, currentFilters]);

  return (
    <AuditFilterContext.Provider value={value}>
      {children}
    </AuditFilterContext.Provider>
  );
}

export function useAuditFilter() {
  const context = useContext(AuditFilterContext);
  if (!context) {
    throw new Error("useAuditFilter must be used within an AuditFilterProvider");
  }
  return context;
}