import { useData } from "@/components/ui/DataProvider";
import { ConsumersTableData, targetColumnName } from "./Consumers.interfaces";
import { useSearchParams } from "react-router-dom";

export function TargetFilterChip() {
  const { table } = useData<ConsumersTableData>();
  const [ , setSearchParams] = useSearchParams();

  const fv = table.getColumn(targetColumnName)?.getFilterValue() as
    | { name?: string; namespace?: string }
    | undefined;

  if (!fv?.name && !fv?.namespace) return null;

  const clear = () => {
    table.getColumn(targetColumnName)?.setFilterValue(undefined);
    setSearchParams((prev) => {
      prev.delete("targetName");
      prev.delete("targetNamespace");
      return prev;
    }, { replace: true });
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
      <span>
        Target: {fv.namespace ? `${fv.namespace}/` : ""}{fv.name ?? "*"}
      </span>
      <button onClick={clear} className="text-xs underline">clear</button>
    </div>
  );
}
