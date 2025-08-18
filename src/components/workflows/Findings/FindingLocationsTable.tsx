import { Badge } from "@/components/ui/badge";
import {
  DataProvider,
  DataTable,
  defineColumns,
} from "@/components/ui/DataProvider";
import { type FindingLocation } from "@/components/workflows/Findings";
import { LucideBookKey, LucideBraces, LucideCopy } from "lucide-react";
import { useMemo } from "react";

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
          header: "Store",
          cell: (info) => (
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1.5 text-sm"
            >
              <LucideBookKey className="text-muted-foreground" />
              {info.getValue()}
            </Badge>
          ),
        }),
        columnHelper.accessor("remoteRef.key", {
          header: "Duplicate Key",
          cell: (info) => (
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1.5 text-sm"
            >
              <LucideCopy className="text-muted-foreground" />
              {info.getValue()}
            </Badge>
          ),
        }),
        columnHelper.accessor("remoteRef.property", {
          header: "Property",
          cell: (info) => {
            const value = info.getValue();
            if (!value || String(value).trim() === "" || value === "-") {
              return <span className="text-muted-foreground">-</span>;
            }
            return (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 text-sm"
              >
                <LucideBraces className="text-muted-foreground" />
                {value}
              </Badge>
            );
          },
        }),
      ]),
    []
  );

  return (
    <DataProvider
      data={locations}
      columns={columns}
      initialSort={{ id: "name", desc: false }}
      getRowId={(row) =>
        `${row.name}-${row.remoteRef.key}-${row.remoteRef.property}`
      }
    >
      <DataTable />
    </DataProvider>
  );
}
