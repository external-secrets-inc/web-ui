import { useEffect } from "react";
import {
  DataSearch,
  DataTable,
  useData,
} from "@/components/ui/DataProvider";
import { ConsumersTableData } from "./Consumers.interfaces";
import { TargetFilterChip } from "./TargetFilterChip";
import { useSearchParams } from "react-router-dom";

interface ConsumerDataTableProps {
  title?: string,
}

export function ConsumerDataTable({ title } : ConsumerDataTableProps) {
  const [params] = useSearchParams();
  const { table } = useData<ConsumersTableData>();

  useEffect(() => {
    const name = params.get("targetName") || undefined;
    const namespace = params.get("targetNamespace") || undefined;

    const hasFilter = Boolean(name || namespace);
    const col = table.getColumn("targetReference");
    if (!col) return;

    col.setFilterValue(hasFilter ? { name, namespace } : undefined);
  }, [params, table]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
        </div>
        <div className="flex justify-end gap-4 items-center">
          <TargetFilterChip />
          <DataSearch />
        </div>
      </div>
      <DataTable />
    </>
  );
}
