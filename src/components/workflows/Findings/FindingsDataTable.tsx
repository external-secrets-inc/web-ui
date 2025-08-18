import { DataTable, useData } from "@/components/ui/DataProvider";
import useOrgLink from "@/hooks/useOrgLink";
import { useNavigate } from "react-router-dom";
import type { FindingsTableData } from "./Findings.interfaces";
import { getDominantKey } from "./Findings.utils";

export function FindingsDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  useData<FindingsTableData>();

  return (
    <DataTable
      onRowClick={(row) => {
        const typedRow = row as FindingsTableData;
        const dominantKey = getDominantKey(typedRow) ?? typedRow.name;
        navigate(
          getOrgLink(
            `/findings/reused-secrets/${typedRow.namespace}/${typedRow.name}`
          ),
          { state: { dominantKey } }
        );
      }}
    />
  );
}
