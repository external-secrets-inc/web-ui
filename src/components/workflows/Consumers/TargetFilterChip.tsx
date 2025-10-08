import { useData } from "@/components/ui/DataProvider";
import { ConsumersTableData, targetColumnName } from "./Consumers.interfaces";
import { useSearchParams } from "react-router-dom";
import { LucideX } from "lucide-react";
import { Trimmer } from "@/components/ui/Trimmer";
import { Badge } from "@/components/ui/badge";
import A11yDivButton from "@/components/ui/A11yDivButton";

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
    <Badge variant="secondary" className="text-sm min-w-0 flex-shrink">
      <span className="font-normal text-foreground">Target:</span>
      <Trimmer className="pl-1">
        {fv.namespace ? `${fv.namespace}/` : ""}{fv.name ?? "*"}
      </Trimmer>
      <A11yDivButton onClick={clear} variant="unstyled" className="pl-2">{<LucideX />}</A11yDivButton>
    </Badge>
  );
}
