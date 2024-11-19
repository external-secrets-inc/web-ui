import { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FilterState } from "./Audit.interfaces";
import { Button } from "../ui/button";

const initialFilters: FilterState = {
  provider: [],
  policy: [],
  secretName: [],
  policyStatus: null,
  duplicates: null,
  lastAccess: null,
  lastRotation: null,
  accessors: null,
};

const FilterComponent = ({ onFiltersChange }: { onFiltersChange: (filters: FilterState) => void }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const autocompleteOptions = {
    policies: ['policy 1', 'another policy', 'starting with other name policy'],
    secretNames: ['secret 1', 'same secret?', 'awkward name']
  }

  // Handle filter changes and propagate them
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value };
      onFiltersChange(updatedFilters); // Pass updated filters to the parent
      return updatedFilters;
    });
  };

  // Handle adding or removing an item from an array filter
  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key] as string[];
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      const updatedFilters = { ...prev, [key]: updatedArray };
      onFiltersChange(updatedFilters);
      return updatedFilters;
    });
  };


  // Reset filters to the initial state
  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  // Get date range for the LastRotation filter (last 90 days)
  const currentDate = new Date().toISOString().split("T")[0];
  const lastRotationMinDate = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split("T")[0];

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Install listener</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div className="p-4 border rounded-md space-y-4">
        {/* Provider Filter */}
        <div>
          <label className="block font-medium mb-1">Providers</label>
          <div className="flex flex-wrap gap-2">
            {["GCP", "Amazon", "Azure"].map((provider) => (
              <label key={provider} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={filters.provider.includes(provider)}
                  onChange={() => toggleArrayFilter("provider", provider)}
                />
                <span>{provider}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Policy Filter */}
        <div>
          <label className="block font-medium mb-1">Policies</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            placeholder="Search or add policies..."
            list="policy-autocomplete"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                toggleArrayFilter("policy", e.currentTarget.value.trim());
                e.currentTarget.value = ""; // Clear input
              }
            }}
          />
          <datalist id="policy-autocomplete">
            {autocompleteOptions.policies.map((policy) => (
              <option key={policy} value={policy} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.policy.map((policy) => (
              <span
                key={policy}
                className="bg-gray-600 px-2 py-1 rounded cursor-pointer"
                onClick={() => toggleArrayFilter("policy", policy)}
              >
                {policy} ✕
              </span>
            ))}
          </div>
        </div>

        {/* Secret Name Filter */}
        <div>
          <label className="block font-medium mb-1">Secret Names</label>
          <input
            type="text"
            className="border rounded px-2 py-1 w-full"
            placeholder="Search or add secret names..."
            list="secret-name-autocomplete"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                toggleArrayFilter("secretName", e.currentTarget.value.trim());
                e.currentTarget.value = ""; // Clear input
              }
            }}
          />
          <datalist id="secret-name-autocomplete">
            {autocompleteOptions.secretNames.map((secretName) => (
              <option key={secretName} value={secretName} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.secretName.map((name) => (
              <span
                key={name}
                className="bg-gray-600 px-2 py-1 rounded cursor-pointer"
                onClick={() => toggleArrayFilter("secretName", name)}
              >
                {name} ✕
              </span>
            ))}
          </div>
        </div>

        {/* Policy Status Filter */}
        <div>
          <label className="block font-medium mb-1">Policy Status</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.policyStatus !== null ? String(filters.policyStatus) : ""}
            onChange={(e) =>
              handleFilterChange("policyStatus", e.target.value === "true" ? true : e.target.value === "false" ? false : null)
            }
          >
            <option value="">All</option>
            <option value="true">Compliant</option>
            <option value="false">Non-Compliant</option>
          </select>
        </div>

        {/* Duplicates Filter */}
        <div>
          <label className="block font-medium mb-1">Duplicates</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.duplicates !== null ? String(filters.duplicates) : ""}
            onChange={(e) =>
              handleFilterChange("duplicates", e.target.value === "true" ? true : e.target.value === "false" ? false : null)
            }
          >
            <option value="">All</option>
            <option value="true">Contains</option>
            <option value="false">Does Not Contain</option>
          </select>
        </div>

        {/* Last Access Filter */}
        <div>
          <label className="block font-medium mb-1">Last Access</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.lastAccess ?? ""}
            onChange={(e) => handleFilterChange("lastAccess", e.target.value)}
          >
            <option value="">All</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
            <option value="date">Specific Date</option>
          </select>
          {filters.lastAccess === "date" && (
            <input
              type="date"
              max={currentDate}
              className="border rounded px-2 py-1 mt-2 w-full"
              onChange={(e) => handleFilterChange("lastAccess", e.target.value)}
            />
          )}
        </div>

        {/* Last Rotation Filter */}
        <div>
          <label className="block font-medium mb-1">Last Rotation</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.lastRotation ?? ""}
            onChange={(e) => handleFilterChange("lastRotation", e.target.value)}
          >
            <option value="">All</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
            <option value="date">Specific Date</option>
          </select>
          {filters.lastRotation === "date" && (
            <input
              type="date"
              min={lastRotationMinDate}
              max={currentDate}
              className="border rounded px-2 py-1 mt-2 w-full"
              onChange={(e) => handleFilterChange("lastRotation", e.target.value)}
            />
          )}
        </div>

        {/* Accessors Filter */}
        <div>
          <label className="block font-medium mb-1">Accessors</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.accessors !== null ? String(filters.accessors) : ""}
            onChange={(e) =>
              handleFilterChange("accessors", e.target.value === "true" ? true : e.target.value === "false" ? false : null)
            }
          >
            <option value="">All</option>
            <option value="true">Contains</option>
            <option value="false">Does Not Contain</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <DialogFooter>
        <div className="text-right mt-4">
          <Button
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default FilterComponent;
