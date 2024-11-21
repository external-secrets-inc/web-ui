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

const ProviderFilter = ({ filters, toggleArrayFilter }: any) => (
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
);

const ArrayFilter = ({ title, filters, toggleArrayFilter, options, listId }: any) => (
  <div>
    <label className="block font-medium mb-1">{title}</label>
    <input
      type="text"
      className="border rounded px-2 py-1 w-full"
      placeholder={`Search or add ${title.toLowerCase()}...`}
      list={listId}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          toggleArrayFilter(listId, e.currentTarget.value.trim());
          e.currentTarget.value = ""; // Clear input
        }
      }}
    />
    <datalist id={listId}>
      {options.map((option: string) => (
        <option key={option} value={option} />
      ))}
    </datalist>
    <div className="flex flex-wrap gap-2 mt-2">
      {filters[listId].map((item: string) => (
        <span
          key={item}
          className="bg-gray-600 px-2 py-1 rounded cursor-pointer"
          onClick={() => toggleArrayFilter(listId, item)}
        >
          {item} ✕
        </span>
      ))}
    </div>
  </div>
);

const SelectFilter = ({ title, filters, handleFilterChange, filterKey, options }: any) => (
  <div>
    <label className="block font-medium mb-1">{title}</label>
    <select
      className="border rounded px-2 py-1 w-full"
      value={filters[filterKey] !== null ? String(filters[filterKey]) : ""}
      onChange={(e) =>
        handleFilterChange(filterKey, e.target.value === "true" ? true : e.target.value === "false" ? false : null)
      }
    >
      {options.map((option: { label: string; value: string | null }) => (
        <option key={option.value} value={option.value ?? ""}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const DateFilter = ({ title, filters, handleFilterChange, filterKey, minDate, maxDate }: any) => (
  <div>
    <label className="block font-medium mb-1">{title}</label>
    <select
      className="border rounded px-2 py-1 w-full"
      value={filters[filterKey] ?? ""}
      onChange={(e) => handleFilterChange(filterKey, e.target.value)}
    >
      <option value="">All</option>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
      <option value="date">Specific Date</option>
    </select>
    {filters[filterKey] === "date" && (
      <input
        type="date"
        min={minDate}
        max={maxDate}
        className="border rounded px-2 py-1 mt-2 w-full"
        onChange={(e) => handleFilterChange(filterKey, e.target.value)}
      />
    )}
  </div>
);

const FilterComponent = ({ onFiltersChange }: { onFiltersChange: (filters: FilterState) => void }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const autocompleteOptions = {
    policies: ['policy 1', 'another policy', 'starting with other name policy'],
    secretNames: ['secret 1', 'same secret?', 'awkward name']
  }

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value };
      onFiltersChange(updatedFilters); // Pass updated filters to the parent
      return updatedFilters;
    });
  };

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

  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const currentDate = new Date().toISOString().split("T")[0];
  const lastRotationMinDate = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split("T")[0];

  return (
    <DialogContent
      className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Filters</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <div className="p-4 border rounded-md space-y-4">
        <ProviderFilter filters={filters} toggleArrayFilter={toggleArrayFilter} />
        <ArrayFilter
          title="Policies"
          filters={filters}
          toggleArrayFilter={toggleArrayFilter}
          options={autocompleteOptions.policies}
          listId="policy"
        />
        <ArrayFilter
          title="Secret Names"
          filters={filters}
          toggleArrayFilter={toggleArrayFilter}
          options={autocompleteOptions.secretNames}
          listId="secretName"
        />
        <SelectFilter
          title="Policy Status"
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterKey="policyStatus"
          options={[
            { label: "All", value: null },
            { label: "Compliant", value: "true" },
            { label: "Non-Compliant", value: "false" },
          ]}
        />
        <SelectFilter
          title="Duplicates"
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterKey="duplicates"
          options={[
            { label: "All", value: null },
            { label: "Contains", value: "true" },
            { label: "Does Not Contain", value: "false" },
          ]}
        />
        <DateFilter
          title="Last Access"
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterKey="lastAccess"
          minDate=""
          maxDate={currentDate}
        />
        <DateFilter
          title="Last Rotation"
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterKey="lastRotation"
          minDate={lastRotationMinDate}
          maxDate={currentDate}
        />
        <SelectFilter
          title="Accessors"
          filters={filters}
          handleFilterChange={handleFilterChange}
          filterKey="accessors"
          options={[
            { label: "All", value: null },
            { label: "Contains", value: "true" },
            { label: "Does Not Contain", value: "false" },
          ]}
        />
      </div>
      <DialogFooter>
        <Button onClick={clearFilters}>Clear</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default FilterComponent;
