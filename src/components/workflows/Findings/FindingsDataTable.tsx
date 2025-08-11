import { DataTable, useData } from "@/components/ui/DataProvider";
import useOrgLink from "@/hooks/useOrgLink";
import type { FindingsTableData } from "./Findings.interfaces";
import { useNavigate } from "react-router-dom";

export function FindingsDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  useData<FindingsTableData>();

  return (
    <DataTable
      onRowClick={(row) => {
        const typedRow = row as FindingsTableData;
        navigate(
          getOrgLink(
            `/findings/reused-secrets/${typedRow.namespace}/${typedRow.name}`
          )
        );
      }}
    />
  );
}
