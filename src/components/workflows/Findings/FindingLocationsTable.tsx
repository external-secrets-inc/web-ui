import { useMemo } from "react";
import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { type FindingLocation } from "@/components/workflows/Findings";
import { Badge } from "@/components/ui/badge";

interface FindingLocationsTableProps {
  locations: FindingLocation[];
}

export function FindingLocationsTable({
  locations,
}: FindingLocationsTableProps) {
  const columns = useMemo(
    () =>
      defineColumns<FindingLocation>((columnHelper) => [
        columnHelper.accessor("name", {
          header: "Store Name",
          cell: (info) => <strong>{info.getValue()}</strong>,
        }),
        columnHelper.accessor("kind", {
          header: "Kind",
        }),
        columnHelper.accessor("remoteRef.key", {
          header: "Key",
        }),
        columnHelper.accessor("remoteRef.property", {
          header: "Property",
          cell: (info) =>
            info.getValue() ? (
              <Badge variant="outline">{info.getValue()}</Badge>
            ) : (
              "-"
            ),
        }),
      ]),
    []
  );

  return (
    <DataProvider
      data={locations}
      columns={columns}
      initialSort={{ id: "name", desc: false }}
      getRowId={(row) => `${row.name}-${row.remoteRef.key}-${row.remoteRef.property}`}
    >
      <DataTable />
    </DataProvider>
  );
}