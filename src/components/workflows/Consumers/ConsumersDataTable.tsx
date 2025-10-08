import { useEffect, useMemo } from "react";
import {
  DataSearch,
  DataTable,
  useData,
} from "@/components/ui/DataProvider";
import { ConsumersTableData, targetColumnName, TargetReference } from "./Consumers.interfaces";
import { TargetFilterChip } from "./TargetFilterChip";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ConsumerDataTableProps {
  title?: string,
}

const applyTargetFilter = (setSearchParams: SetURLSearchParams, ref: string) => {
  const splittedRef = ref.split("/")
  if (splittedRef.length !== 2) return;

  setSearchParams(
    (prev) => {
      prev.set("targetNamespace", splittedRef[0]);
      prev.set("targetName", splittedRef[1]);
      return prev;
    },
    { replace: true }
  );
};

export function ConsumerDataTable({ title } : ConsumerDataTableProps) {
  const [params, setSearchParams] = useSearchParams();
  const { table } = useData<ConsumersTableData>();

  const targetValues = useMemo(() => {
    const rows = table.getRowModel().rows;
    const values = rows.map((row) => row.getValue(targetColumnName)) as TargetReference[];

    // Deduplicate by namespace/name
    const uniqueTargets = Array.from(
      new Map(values.map((v) => [`${v.namespace}/${v.name}`, v])).values()
    );

    return uniqueTargets;
  }, [table]);

  const filterTargetName = params.get("targetName") || undefined;
  const filterTargetNamespace = params.get("targetNamespace") || undefined;
  const hasFilter = Boolean(filterTargetName || filterTargetNamespace);
  useEffect(() => {
    const col = table.getColumn(targetColumnName);
    if (!col) return;

    col.setFilterValue(hasFilter ? { name: filterTargetName, namespace: filterTargetNamespace } : undefined);
  }, [params, table, hasFilter, filterTargetName, filterTargetNamespace]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
        </div>
        <div className="flex justify-end gap-4 items-center">
          <TargetFilterChip />
          <DataSearch />
          <div className={cn("flex items-center gap-1")}>
            <Select
              value={hasFilter ? `${filterTargetNamespace || ""}/${filterTargetName || ""}` : "Filter by target"}
              onValueChange={(value) => applyTargetFilter(setSearchParams, value)}
            >
              <SelectTrigger className="w-48 max-w-full">
                <SelectValue>
                  {hasFilter ? `${filterTargetName || ""}` : <span className="text-muted-foreground">Filter by target </span>}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {targetValues.map((target) => (
                  <SelectItem
                    key={`${target.namespace}/${target.name}`}
                    value={`${target.namespace}/${target.name}`}
                  >
                    {target.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DataTable />
    </>
  );
}
